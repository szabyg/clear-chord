import React from "react";
import { Button } from "@/components/ui/button";
import { useIntervalState } from "@/hooks/useIntervalState";
import { PageLayout } from "@/components/PageLayout";
import { NoteSlider } from "@/components/NoteSlider";
import { ControlPanel } from "@/components/ControlPanel";
import { IntervalInfo } from "@/components/IntervalInfo";
import { IntervalName, INTERVALS } from "@/constants/intervals";

export default function BeatFreeIntervals() {
  const {
    NOTE_NAMES,
    detuneCents,
    setDetuneCents,
    activeNotes,
    toggleNote,
    togglePlayback,
    resetPitches,
    isPlaying,
    rootNote,
    setRootNote,
    selectedInterval,
    setSelectedInterval,
    applySelectedInterval,
    tuneBeatFree,
  } = useIntervalState();

  return (
    <PageLayout title="Beat-Free Intervals">
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
        <Button onClick={applySelectedInterval}>Apply Interval</Button>
        <Button onClick={tuneBeatFree}>Tune Beat-Free</Button>
      </ControlPanel>

      <IntervalInfo selectedInterval={selectedInterval} />

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
