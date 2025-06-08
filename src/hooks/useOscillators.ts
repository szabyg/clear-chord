import { useRef } from "react";
import { calculateFrequencies } from "@/constants/frequencies";
import { detuneFrequency } from "@/utils/frequencyUtils";

export function useOscillators(
  isPlaying: boolean,
  activeNotes: Record<string, boolean>,
  detuneCents: Record<string, number>,
  transitionTimeMs: number = 500,
  targetDetuneCents?: Record<string, number>
) {
  const audioCtx = useRef(
    new (window.AudioContext || (window as any).webkitAudioContext)()
  );
  const oscillatorsRef = useRef<Record<string, any>>({});
  const BASE_FREQUENCIES = calculateFrequencies();
  const FADE_TIME = 0.05; // 50ms fade time
  const FREQ_TRANSITION_TIME = transitionTimeMs / 1000; // Convert ms to seconds

  const startOscillators = () => {
    const now = audioCtx.current.currentTime;
    Object.keys(activeNotes).forEach((note) => {
      if (!activeNotes[note]) return;
      const baseNote = note.replace("'", "");
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = "sine";

      // Set initial frequency (default frequency for the oscillator)
      const targetFreq = detuneFrequency(
        BASE_FREQUENCIES[note],
        detuneCents[baseNote]
      );
      osc.frequency.setValueAtTime(targetFreq, now);

      // For new oscillators, we don't need to transition from a previous value
      // But we'll keep the code consistent with updateOscillators for maintainability

      // Start with zero gain and fade in
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + FADE_TIME);

      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      oscillatorsRef.current[note] = { osc, gain };
    });
  };

  const stopOscillators = () => {
    const now = audioCtx.current.currentTime;
    const oscillatorStopPromises: Promise<void>[] = [];

    Object.entries(oscillatorsRef.current).forEach(([note, { osc, gain }]) => {
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

    Object.keys(activeNotes).forEach((note) => {
      const baseNote = note.replace("'", "");
      const oscObj = oscillatorsRef.current[note];
      if (oscObj && activeNotes[note]) {
        // Set current frequency value
        oscObj.osc.frequency.setValueAtTime(oscObj.osc.frequency.value, now);
        // Gradually transition to the new frequency over FREQ_TRANSITION_TIME
        // Use targetDetuneCents if provided, otherwise use detuneCents
        const detuneValue = targetDetuneCents ? targetDetuneCents[baseNote] : detuneCents[baseNote];
        oscObj.osc.frequency.linearRampToValueAtTime(
          detuneFrequency(BASE_FREQUENCIES[note], detuneValue),
          now + FREQ_TRANSITION_TIME
        );
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
