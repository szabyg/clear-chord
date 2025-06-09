import { useRef } from "react";
import { calculateFrequencies } from "@/constants/frequencies";
import { detuneFrequency } from "@/utils/frequencyUtils";

// Define interfaces for better type safety
interface OscillatorNode {
  frequency: {
    value: number;
    setValueAtTime: (value: number, time: number) => void;
    linearRampToValueAtTime: (value: number, time: number) => void;
    cancelScheduledValues: (time: number) => void;
  };
  type: OscillatorType;
  connect: (destination: AudioNode) => void;
  start: () => void;
  stop: () => void;
}

interface GainNode {
  gain: {
    value: number;
    setValueAtTime: (value: number, time: number) => void;
    linearRampToValueAtTime: (value: number, time: number) => void;
    cancelScheduledValues: (time: number) => void;
  };
  connect: (destination: AudioNode) => void;
}

interface OscillatorWithGain {
  osc: OscillatorNode;
  gain: GainNode;
}

interface OscillatorControls {
  startOscillators: () => void;
  stopOscillators: () => void;
  updateOscillators: () => void;
}

export function useOscillators(
  // Removed unused isPlaying parameter
  activeNotes: Record<string, boolean>,
  detuneCents: Record<string, number>,
  transitionTimeMs: number = 500,
  targetDetuneCents?: Record<string, number>,
  isImmediateUpdate: boolean = false
): OscillatorControls {
  // Use proper AudioContext type
  const audioCtx = useRef<AudioContext>(
    new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  );
  const oscillatorsRef = useRef<Record<string, OscillatorWithGain>>({});
  const BASE_FREQUENCIES = calculateFrequencies();
  const FADE_TIME = 0.05; // 50ms fade time
  const FREQ_TRANSITION_TIME = transitionTimeMs / 1000; // Convert ms to seconds
  const BASE_GAIN = 0.2; // Base gain value for a single note

  // Calculate the number of active notes
  const getActiveNotesCount = (): number => {
    return Object.values(activeNotes).filter(active => active).length;
  };

  // Calculate adjusted gain based on number of active notes
  const calculateAdjustedGain = (): number => {
    const activeCount = getActiveNotesCount();
    // Scale down gain as more notes are added
    // For 1-3 notes, use BASE_GAIN
    // For 4+ notes, scale down to prevent clipping
    if (activeCount <= 3) {
      return BASE_GAIN;
    } else {
      // Formula: BASE_GAIN * (3 / activeCount)
      // This ensures that with 4 notes, gain is 0.15, with 6 notes it's 0.1, etc.
      return BASE_GAIN * (3 / activeCount);
    }
  };

  // Update gain for all active oscillators
  const updateAllGains = () => {
    const now = audioCtx.current.currentTime;
    const adjustedGain = calculateAdjustedGain();

    Object.entries(oscillatorsRef.current).forEach(([noteKey, { gain }]) => {
      if (activeNotes[noteKey]) {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(adjustedGain, now + FADE_TIME);
      }
    });
  };

  const startOscillators = () => {
    const now = audioCtx.current.currentTime;
    // Calculate adjusted gain based on number of active notes
    const adjustedGain = calculateAdjustedGain();

    Object.keys(activeNotes).forEach((note) => {
      if (!activeNotes[note]) return;
      const baseNote = note.replace("'", "");
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = "sine";

      // Set initial frequency (default frequency for the oscillator)
      const baseFrequency = BASE_FREQUENCIES[note];
      if (baseFrequency === undefined) {
        console.warn(`Base frequency for note ${note} is undefined`);
        return; // Skip this note
      }

      const detuneValue = detuneCents[baseNote];
      if (detuneValue === undefined) {
        console.warn(`Detune value for note ${baseNote} is undefined`);
        return; // Skip this note
      }

      const targetFreq = detuneFrequency(baseFrequency, detuneValue);
      osc.frequency.setValueAtTime(targetFreq, now);

      // For new oscillators, we don't need to transition from a previous value
      // But we'll keep the code consistent with updateOscillators for maintainability

      // Start with zero gain and fade in to the adjusted gain value
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(adjustedGain, now + FADE_TIME);

      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      oscillatorsRef.current[note] = { osc, gain };
    });
  };

  const stopOscillators = () => {
    const now = audioCtx.current.currentTime;
    const oscillatorStopPromises: Promise<void>[] = [];

    Object.entries(oscillatorsRef.current).forEach(([_noteKey, { osc, gain }]) => {
      // Create a promise that resolves after the fade-out
      const stopPromise = new Promise<void>((resolve) => {
        // Fade out gain
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + FADE_TIME);

        // Stop oscillator after fade-out
        setTimeout(() => {
          osc.stop();
          resolve();
        }, FADE_TIME * 1000);
      });

      oscillatorStopPromises.push(stopPromise);
    });

    // Clear oscillator references after all fades complete
    Promise.all(oscillatorStopPromises).then(() => {
      oscillatorsRef.current = {};
    });
  };

  const updateOscillators = () => {
    const now = audioCtx.current.currentTime;
    const adjustedGain = calculateAdjustedGain();

    // Update gain for all oscillators first
    updateAllGains();

    Object.keys(activeNotes).forEach((note) => {
      const baseNote = note.replace("'", "");
      const oscObj = oscillatorsRef.current[note];

      if (activeNotes[note]) {
        if (oscObj) {
          // Update existing oscillator
          // Use targetDetuneCents if provided, otherwise use detuneCents
          const detuneValue = targetDetuneCents ? targetDetuneCents[baseNote] : detuneCents[baseNote];
          if (detuneValue === undefined) {
            console.warn(`Detune value for note ${baseNote} is undefined`);
            return; // Skip this note
          }

          const baseFrequency = BASE_FREQUENCIES[note];
          if (baseFrequency === undefined) {
            console.warn(`Base frequency for note ${note} is undefined`);
            return; // Skip this note
          }

          const targetFreq = detuneFrequency(baseFrequency, detuneValue);

          if (isImmediateUpdate) {
            // For immediate updates (slider adjustments), set the frequency immediately
            oscObj.osc.frequency.cancelScheduledValues(now);
            oscObj.osc.frequency.setValueAtTime(targetFreq, now);
          } else {
            // For gradual updates (button clicks), transition over time
            oscObj.osc.frequency.setValueAtTime(oscObj.osc.frequency.value, now);
            oscObj.osc.frequency.linearRampToValueAtTime(
              targetFreq,
              now + FREQ_TRANSITION_TIME
            );
          }
        } else {
          // Create new oscillator for newly activated note
          const osc = audioCtx.current.createOscillator();
          const gain = audioCtx.current.createGain();
          osc.type = "sine";

          // Set initial frequency
          const detuneValue = targetDetuneCents ? targetDetuneCents[baseNote] : detuneCents[baseNote];
          if (detuneValue === undefined) {
            console.warn(`Detune value for note ${baseNote} is undefined`);
            return; // Skip this note
          }

          const baseFrequency = BASE_FREQUENCIES[note];
          if (baseFrequency === undefined) {
            console.warn(`Base frequency for note ${note} is undefined`);
            return; // Skip this note
          }

          const targetFreq = detuneFrequency(baseFrequency, detuneValue);

          // For new oscillators, we always set the initial frequency immediately
          // but we can schedule a transition if needed
          osc.frequency.setValueAtTime(targetFreq, now);

          // Start with zero gain and fade in
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(adjustedGain, now + FADE_TIME);

          osc.connect(gain);
          gain.connect(audioCtx.current.destination);
          osc.start();
          oscillatorsRef.current[note] = { osc, gain };
        }
      } else if (!activeNotes[note] && oscObj) {
        // Fade out before stopping
        oscObj.gain.gain.cancelScheduledValues(now);
        oscObj.gain.gain.setValueAtTime(oscObj.gain.gain.value, now);
        oscObj.gain.gain.linearRampToValueAtTime(0, now + FADE_TIME);

        setTimeout(() => {
          if (oscillatorsRef.current[note]) {
            oscillatorsRef.current[note].osc.stop();
            delete oscillatorsRef.current[note];
          }
        }, FADE_TIME * 1000);
      }
    });
  };

  return { startOscillators, stopOscillators, updateOscillators };
}
