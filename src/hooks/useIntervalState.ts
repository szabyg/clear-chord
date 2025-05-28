import { useState } from "react";
import { useNoteState } from "./useNoteState";
import { IntervalName, INTERVALS } from "@/constants/intervals";
import { intervalUtils } from "@/utils/intervalUtils";

export function useIntervalState() {
  const noteState = useNoteState("beatFree");
  const [rootNote, setRootNote] = useState("C");
  const [selectedInterval, setSelectedInterval] = useState<IntervalName>("Perfect Fifth");

  const applySelectedInterval = () => {
    // Get the root note index
    const rootIndex = noteState.NOTE_NAMES.indexOf(rootNote);

    // Get the interval details
    const interval = INTERVALS[selectedInterval];

    // Calculate the second note index
    const secondNoteIndex = (rootIndex + interval.semitones) % 12;
    const secondNote = noteState.NOTE_NAMES[secondNoteIndex];

    // Set the root note and second note as active
    const newActiveNotes = { ...noteState.initialActives };
    newActiveNotes[rootNote] = true;
    newActiveNotes[rootNote + "'"] = true;
    newActiveNotes[secondNote] = true;
    newActiveNotes[secondNote + "'"] = true;

    noteState.setActiveNotes(newActiveNotes);
  };

  const tuneBeatFree = () => {
    // Keep the current active notes
    const currentActiveNotes = { ...noteState.activeNotes };

    // Find the lowest active note
    let lowestNoteIndex = -1;
    for (let i = 0; i < noteState.NOTE_NAMES.length; i++) {
      const note = noteState.NOTE_NAMES[i];
      if (currentActiveNotes[note] || currentActiveNotes[note + "'"]) {
        lowestNoteIndex = i;
        break;
      }
    }

    // If no active notes, do nothing
    if (lowestNoteIndex === -1) return;

    // Create new detune cents object
    const newDetuneCents = { ...noteState.initialDetunes };

    // For each active note, calculate the beat-free interval based on its distance from the lowest note
    for (let i = 0; i < noteState.NOTE_NAMES.length; i++) {
      const note = noteState.NOTE_NAMES[i];

      // Skip inactive notes
      if (!currentActiveNotes[note] && !currentActiveNotes[note + "'"]) continue;

      // Skip the lowest note (it's our reference)
      if (i === lowestNoteIndex) continue;

      // Calculate semitone distance from lowest note
      let semitones = i - lowestNoteIndex;
      if (semitones < 0) semitones += 12; // Wrap around for notes below the lowest

      // Find the closest just intonation interval
      let bestRatio = 1;
      let smallestDifference = Infinity;

      // Check all intervals to find the one that best matches this semitone distance
      for (const intervalName in INTERVALS) {
        if (Object.prototype.hasOwnProperty.call(INTERVALS, intervalName)) {
          const interval = INTERVALS[intervalName as IntervalName];
          if (interval.semitones === semitones) {
            // Exact match found
            bestRatio = interval.ratio;
            break;
          }

          // Calculate how close this interval is to the desired semitone distance
          const difference = Math.abs(interval.semitones - semitones);
          if (difference < smallestDifference) {
            smallestDifference = difference;
            bestRatio = interval.ratio;
          }
        }
      }

      // Calculate the cent difference for this note
      const centsDifference = intervalUtils.calculateCentsDifference(bestRatio, semitones);

      // Update the detune cents for this note
      newDetuneCents[note] = centsDifference;
    }

    noteState.setDetuneCents(newDetuneCents);
  };

  return {
    ...noteState,
    rootNote,
    setRootNote,
    selectedInterval,
    setSelectedInterval,
    applySelectedInterval,
    tuneBeatFree,
  };
}
