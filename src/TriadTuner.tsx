import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOscillators } from "@/hooks/useOscillators";
import {
  initializeDetuneCents,
  initializeActiveNotes,
  applyChordLogic,
} from "@/utils/noteUtils";

const CHORD_TYPES: Record<string, number[]> = {
  Dur: [0, 4, 7],
  Moll: [0, 3, 7],
  Maj7: [0, 4, 7, 11],
};

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

const NOTES = NOTE_NAMES.concat(NOTE_NAMES.map((n) => n + "'")).flat();

export default function TriadTuner() {
  const initialDetunes = initializeDetuneCents(NOTE_NAMES);
  const initialActives = initializeActiveNotes(NOTES);

  const [detuneCents, setDetuneCents] = useLocalStorageState(
    "detuneCents",
    initialDetunes
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useLocalStorageState("activeNotes", initialActives);
  const [rootNote, setRootNote] = useState("C");
  const [chordType, setChordType] = useState("Dur");

  const { startOscillators, stopOscillators, updateOscillators } =
    useOscillators(isPlaying, activeNotes, detuneCents);

  const applyChord = () => {
    setActiveNotes(applyChordLogic(rootNote, chordType, NOTE_NAMES, NOTES));
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
          <h1 className="text-2xl font-bold">Tone Tuner</h1>
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
            <label className="block font-medium mb-1">Chord Type</label>
            <select
              className="border p-2 rounded"
              value={chordType}
              onChange={(e) => setChordType(e.target.value)}
            >
              {Object.keys(CHORD_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button onClick={applyChord}>Apply Chord</Button>
            <Button onClick={resetPitches}>Reset Pitches</Button>
            <Button onClick={togglePlayback}>
              {isPlaying ? "Stop" : "Play"}
            </Button>
          </div>
        </div>

        {NOTE_NAMES.map((note) => (
          <div key={note} className="space-y-2">
            <label
              className={`block font-medium cursor-pointer ${activeNotes[note] || activeNotes[note + "'"] ? "text-black" : "text-gray-400"}`}
              onClick={() => toggleNote(note)}
            >
              {note} / {note}' : {detuneCents[note]} cents
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
