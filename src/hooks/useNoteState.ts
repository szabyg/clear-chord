import { useState, useEffect } from "react";
import { useLocalStorageState } from "./useLocalStorageState";
import { useOscillators } from "./useOscillators";
import { initializeDetuneCents, initializeActiveNotes } from "@/utils/noteUtils";
import { NOTE_NAMES, getNotes } from "@/constants/notes";

export function useNoteState(storagePrefix: string = "") {
  const NOTES = getNotes();
  const initialDetunes = initializeDetuneCents(NOTE_NAMES);
  const initialActives = initializeActiveNotes(NOTES);

  const [detuneCents, setDetuneCents] = useLocalStorageState(
    `${storagePrefix}detuneCents`,
    initialDetunes
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useLocalStorageState(
    `${storagePrefix}activeNotes`,
    initialActives
  );

  const { startOscillators, stopOscillators, updateOscillators } =
    useOscillators(isPlaying, activeNotes, detuneCents);

  useEffect(() => {
    if (isPlaying) {
      startOscillators();
    } else {
      stopOscillators();
    }
  }, [isPlaying, startOscillators, stopOscillators]);

  useEffect(() => {
    if (isPlaying) {
      updateOscillators();
    }
  }, [detuneCents, activeNotes, isPlaying, updateOscillators]);

  const toggleNote = (note: string) => {
    setActiveNotes((prev) => ({
      ...prev,
      [note]: !prev[note],
      [note + "'"]: !prev[note + "'"],
    }));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPitches = () => {
    setDetuneCents(initialDetunes);
  };

  return {
    NOTE_NAMES,
    NOTES,
    detuneCents,
    setDetuneCents,
    isPlaying,
    setIsPlaying,
    activeNotes,
    setActiveNotes,
    toggleNote,
    togglePlayback,
    resetPitches,
    initialDetunes,
    initialActives,
  };
}
