import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNoteState } from "@/hooks/useNoteState";
import { applyChordLogic } from "@/utils/noteUtils";
import { PageLayout } from "@/components/PageLayout";
import { NoteSlider } from "@/components/NoteSlider";
import { ControlPanel } from "@/components/ControlPanel";

const CHORD_TYPES: Record<string, number[]> = {
  Dur: [0, 4, 7],
  Moll: [0, 3, 7],
  Maj7: [0, 4, 7, 11],
};

export default function TriadTuner() {
  const {
    NOTE_NAMES,
    NOTES,
    detuneCents,
    setDetuneCents,
    activeNotes,
    setActiveNotes,
    toggleNote,
    togglePlayback,
    resetPitches,
    isPlaying,
  } = useNoteState();

  const [rootNote, setRootNote] = useState("C");
  const [chordType, setChordType] = useState("Dur");

  const applyChord = () => {
    setActiveNotes(applyChordLogic(rootNote, chordType, NOTE_NAMES, NOTES));
  };

  return (
    <PageLayout title="Tone Tuner">
      <ControlPanel
        isPlaying={isPlaying}
        onTogglePlayback={togglePlayback}
        onResetPitches={resetPitches}
      >
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
        <Button onClick={applyChord}>Apply Chord</Button>
      </ControlPanel>

      {NOTE_NAMES.map((note) => (
        <NoteSlider
          key={note}
          note={note}
          detuneCents={detuneCents[note]}
          isActive={activeNotes[note] || activeNotes[note + "'"]}
          onToggle={toggleNote}
          onValueChange={(val) =>
            setDetuneCents((prev) => ({ ...prev, [note]: val }))
          }
        />
      ))}
    </PageLayout>
  );
}
