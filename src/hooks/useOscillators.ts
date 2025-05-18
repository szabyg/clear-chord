import { useRef } from "react";
import { calculateFrequencies } from "@/constants/frequencies";
import { detuneFrequency } from "@/utils/frequencyUtils";

export function useOscillators(
  isPlaying: boolean,
  activeNotes: Record<string, boolean>,
  detuneCents: Record<string, number>
) {
  const audioCtx = useRef(
    new (window.AudioContext || (window as any).webkitAudioContext)()
  );
  const oscillatorsRef = useRef<Record<string, any>>({});
  const BASE_FREQUENCIES = calculateFrequencies();

  const startOscillators = () => {
    Object.keys(activeNotes).forEach((note) => {
      if (!activeNotes[note]) return;
      const baseNote = note.replace("'", "");
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        detuneFrequency(BASE_FREQUENCIES[note], detuneCents[baseNote]),
        audioCtx.current.currentTime
      );
      gain.gain.setValueAtTime(0.2, audioCtx.current.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      oscillatorsRef.current[note] = { osc, gain };
    });
  };

  const stopOscillators = () => {
    Object.values(oscillatorsRef.current).forEach(({ osc }) => osc.stop());
    oscillatorsRef.current = {};
  };

  const updateOscillators = () => {
    Object.keys(activeNotes).forEach((note) => {
      const baseNote = note.replace("'", "");
      const oscObj = oscillatorsRef.current[note];
      if (oscObj && activeNotes[note]) {
        oscObj.osc.frequency.setValueAtTime(
          detuneFrequency(BASE_FREQUENCIES[note], detuneCents[baseNote]),
          audioCtx.current.currentTime
        );
      } else if (!activeNotes[note] && oscObj) {
        oscObj.osc.stop();
        delete oscillatorsRef.current[note];
      }
    });
  };

  return { startOscillators, stopOscillators, updateOscillators };
}
