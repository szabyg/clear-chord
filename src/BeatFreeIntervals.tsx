import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOscillators } from "@/hooks/useOscillators";
import {
  initializeDetuneCents,
  initializeActiveNotes,
} from "@/utils/noteUtils";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "H",
];

type IntervalName =
  | "Perfect Octave"
  | "Perfect Fifth"
  | "Perfect Fourth"
  | "Major Third"
  | "Minor Third"
  | "Major Sixth"
  | "Minor Sixth"
  | "Major Second"
  | "Minor Second"
  | "Major Seventh"
  | "Minor Seventh";

const INTERVALS: Record<IntervalName, { ratio: number; semitones: number }> = {
  "Perfect Octave": { ratio: 2 / 1, semitones: 12 },
  "Perfect Fifth": { ratio: 3 / 2, semitones: 7 },
  "Perfect Fourth": { ratio: 4 / 3, semitones: 5 },
  "Major Third": { ratio: 5 / 4, semitones: 4 },
  "Minor Third": { ratio: 6 / 5, semitones: 3 },
  "Major Sixth": { ratio: 5 / 3, semitones: 9 },
  "Minor Sixth": { ratio: 8 / 5, semitones: 8 },
  "Major Second": { ratio: 9 / 8, semitones: 2 },
  "Minor Second": { ratio: 16 / 15, semitones: 1 },
  "Major Seventh": { ratio: 15 / 8, semitones: 11 },
  "Minor Seventh": { ratio: 16 / 9, semitones: 10 },
};

// Convert frequency ratio to cents
const ratioCents = (ratio: number): number => {
  return 1200 * Math.log2(ratio);
};

// Calculate the difference in cents between just intonation and equal temperament
const calculateCentsDifference = (ratio: number, semitones: number): number => {
  const equalTemperamentCents = semitones * 100; // 100 cents per semitone in equal temperament
  const justIntonationCents = ratioCents(ratio);
  return justIntonationCents - equalTemperamentCents;
};

export default function BeatFreeIntervals() {
  const initialDetunes = initializeDetuneCents(NOTE_NAMES);
  const NOTES = NOTE_NAMES.concat(NOTE_NAMES.map((n) => n + "'")).flat();
  const initialActives = initializeActiveNotes(NOTES);

  const [detuneCents, setDetuneCents] = useLocalStorageState(
    "beatFreeDetuneCents",
    initialDetunes
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useLocalStorageState(
    "beatFreeActiveNotes",
    initialActives
  );
  const [rootNote, setRootNote] = useState("C");
  const [selectedInterval, setSelectedInterval] = useState<IntervalName>("Perfect Fifth");

  const { startOscillators, stopOscillators, updateOscillators } =
    useOscillators(isPlaying, activeNotes, detuneCents);

  const applySelectedInterval = () => {
    // Get the root note index
    const rootIndex = NOTE_NAMES.indexOf(rootNote);

    // Get the interval details
    const interval = INTERVALS[selectedInterval];

    // Calculate the second note index
    const secondNoteIndex = (rootIndex + interval.semitones) % 12;
    const secondNote = NOTE_NAMES[secondNoteIndex];

    // Set the root note and second note as active
    const newActiveNotes = { ...initialActives };
    newActiveNotes[rootNote] = true;
    newActiveNotes[rootNote + "'"] = true;
    newActiveNotes[secondNote] = true;
    newActiveNotes[secondNote + "'"] = true;

    setActiveNotes(newActiveNotes);
  };

  const tuneBeatFree = () => {
    // Keep the current active notes
    const currentActiveNotes = { ...activeNotes };

    // Find the lowest active note
    let lowestNoteIndex = -1;
    for (let i = 0; i < NOTE_NAMES.length; i++) {
      const note = NOTE_NAMES[i];
      if (currentActiveNotes[note] || currentActiveNotes[note + "'"]) {
        lowestNoteIndex = i;
        break;
      }
    }

    // If no active notes, do nothing
    if (lowestNoteIndex === -1) return;

    const lowestNote = NOTE_NAMES[lowestNoteIndex];

    // Create new detune cents object
    const newDetuneCents = { ...initialDetunes };

    // For each active note, calculate the beat-free interval based on its distance from the lowest note
    for (let i = 0; i < NOTE_NAMES.length; i++) {
      const note = NOTE_NAMES[i];

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
      const centsDifference = calculateCentsDifference(bestRatio, semitones);

      // Update the detune cents for this note
      newDetuneCents[note] = centsDifference;
    }

    setDetuneCents(newDetuneCents);
  };

  const resetPitches = () => {
    setDetuneCents(initialDetunes);
  };

  useEffect(() => {
    if (isPlaying) {
      startOscillators();
    } else {
      stopOscillators();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      updateOscillators();
    }
  }, [detuneCents, activeNotes]);

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

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Beat-Free Intervals</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block font-medium mb-1">Root Note</label>
            <select
              className="border p-2 rounded"
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
            >
              {NOTE_NAMES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Interval</label>
            <select
              className="border p-2 rounded"
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value as IntervalName)}
            >
              {(Object.keys(INTERVALS) as IntervalName[]).map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button onClick={applySelectedInterval}>Apply Interval</Button>
            <Button onClick={tuneBeatFree}>Tune Beat-Free</Button>
            <Button onClick={resetPitches}>Equal temperament</Button>
            <Button onClick={togglePlayback}>
              {isPlaying ? "Stop" : "Play"}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Interval Information</h2>
          <p>
            <strong>Ratio:</strong> {INTERVALS[selectedInterval].ratio} (Just
            Intonation)
          </p>
          <p>
            <strong>Cents Difference:</strong>{" "}
            {calculateCentsDifference(
              INTERVALS[selectedInterval].ratio,
              INTERVALS[selectedInterval].semitones
            ).toFixed(2)}{" "}
            cents from Equal Temperament
          </p>
        </div>

        {NOTE_NAMES.map((note) => (
          <div key={note} className="space-y-2">
            <label
              className={`block font-medium cursor-pointer ${activeNotes[note] || activeNotes[note + "'"] ? "text-black" : "text-gray-400"}`}
              onClick={() => toggleNote(note)}
            >
              {note} : {detuneCents[note]} cents
            </label>
            <Slider
              min={-50.0}
              max={50.0}
              step={0.1}
              value={[detuneCents[note]]}
              disabled={!(activeNotes[note] || activeNotes[note + "'"])}
              onValueChange={([val]) =>
                setDetuneCents((prev) => ({ ...prev, [note]: val }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
