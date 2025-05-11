import React, { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { saveToLocalStorage, loadFromLocalStorage } from "@/utils/storage";

const AudioContextClass =
  typeof window.AudioContext !== "undefined"
    ? window.AudioContext
    : (window as any).webkitAudioContext;
const audioCtx = new AudioContextClass();

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

const BASE_FREQUENCIES: Record<string, number> = NOTES.reduce(
  (acc, note, i) => {
    acc[note] = 130.81 * Math.pow(2, i / 12); // start from lower C
    return acc;
  },
  {} as Record<string, number>
);

function detuneFrequency(baseFreq: number, cents: number): number {
  return baseFreq * Math.pow(2, cents / 1200);
}

export default function TriadTuner() {
  const initialDetunes = NOTE_NAMES.reduce(
    (acc, note) => {
      acc[note] = 0;
      return acc;
    },
    {} as Record<string, number>
  );

  const initialActives = NOTES.reduce(
    (acc, note) => {
      acc[note] = false;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const [detuneCents, setDetuneCents] = useState<Record<string, number>>(() =>
    loadFromLocalStorage("detuneCents", initialDetunes)
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState(initialActives);
  const [waveform, setWaveform] = useState("sine");
  const [rootNote, setRootNote] = useState("C");
  const [chordType, setChordType] = useState("Dur");
  const oscillatorsRef = useRef<Record<string, any>>({});

  const applyChord = () => {
    const intervals = CHORD_TYPES[chordType];
    const rootIndex = NOTE_NAMES.indexOf(rootNote);
    const updated: Record<string, boolean> = {};
    NOTES.forEach((n) => (updated[n] = false));
    intervals.forEach((offset) => {
      const note = NOTE_NAMES[(rootIndex + offset) % 12];
      updated[note] = true;
      updated[note + "'"] = true;
    });
    setActiveNotes(updated);
  };

  const resetPitches = () => {
    setDetuneCents(initialDetunes);
  };

  useEffect(() => {
    saveToLocalStorage("detuneCents", detuneCents);
  }, [detuneCents]);

  useEffect(() => {
    if (isPlaying) {
      NOTES.forEach((note) => {
        if (!activeNotes[note]) return;
        const baseNote = note.replace("'", "");
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = waveform;
        osc.frequency.setValueAtTime(
          detuneFrequency(BASE_FREQUENCIES[note], detuneCents[baseNote]),
          audioCtx.currentTime
        );
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        oscillatorsRef.current[note] = { osc, gain };
      });
    } else {
      Object.values(oscillatorsRef.current).forEach(({ osc }) => osc.stop());
      oscillatorsRef.current = {};
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      NOTES.forEach((note) => {
        const baseNote = note.replace("'", "");
        const oscObj = oscillatorsRef.current[note];
        if (oscObj && activeNotes[note]) {
          oscObj.osc.frequency.setValueAtTime(
            detuneFrequency(BASE_FREQUENCIES[note], detuneCents[baseNote]),
            audioCtx.currentTime
          );
        }
      });
    }
  }, [detuneCents]);

  useEffect(() => {
    if (!isPlaying) return;
    NOTES.forEach((note) => {
      const baseNote = note.replace("'", "");
      const isActive = activeNotes[note];
      const oscObj = oscillatorsRef.current[note];
      if (isActive && !oscObj) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = waveform;
        osc.frequency.setValueAtTime(
          detuneFrequency(BASE_FREQUENCIES[note], detuneCents[baseNote]),
          audioCtx.currentTime
        );
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        oscillatorsRef.current[note] = { osc, gain };
      } else if (!isActive && oscObj) {
        oscObj.osc.stop();
        delete oscillatorsRef.current[note];
      }
    });
  }, [activeNotes]);

  const toggleNote = (note: string) => {
    setActiveNotes((prev) => ({
      ...prev,
      [note]: !prev[note],
      [note + "'"]: !prev[note + "'"],
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Tone Tuner</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Waveform Type</label>
        <select
          className="border p-2 rounded"
          value={waveform}
          onChange={(e) => setWaveform(e.target.value)}
        >
          <option value="sine">Sine (default)</option>
          <option value="triangle">Triangle</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
        </select>
      </div>

      <div className="flex gap-4">
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
        <div className="flex items-end gap-2">
          <Button onClick={applyChord}>Apply Chord</Button>
          <Button onClick={resetPitches}>Reset Pitches</Button>
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
            onValueChange={([val]) =>
              setDetuneCents((prev) => ({ ...prev, [note]: val }))
            }
          />
        </div>
      ))}

      <div className="space-x-4">
        <Button onClick={() => setIsPlaying(true)} disabled={isPlaying}>
          Play
        </Button>
        <Button onClick={() => setIsPlaying(false)} disabled={!isPlaying}>
          Stop
        </Button>
      </div>
    </div>
  );
}
