const CHORD_TYPES: Record<string, number[]> = {
  Dur: [0, 4, 7],
  Moll: [0, 3, 7],
  Maj7: [0, 4, 7, 11],
};

export function initializeDetuneCents(
  noteNames: string[]
): Record<string, number> {
  return noteNames.reduce(
    (acc, note) => {
      acc[note] = 0;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function initializeActiveNotes(
  notes: string[]
): Record<string, boolean> {
  return notes.reduce(
    (acc, note) => {
      // Set C and E as active by default
      acc[note] = note === "C" || note === "E" || note === "C'" || note === "E'";
      return acc;
    },
    {} as Record<string, boolean>
  );
}

export function applyChordLogic(
  rootNote: string,
  chordType: string,
  noteNames: string[],
  notes: string[]
): Record<string, boolean> {
  const intervals = CHORD_TYPES[chordType];
  const rootIndex = noteNames.indexOf(rootNote);
  const updated: Record<string, boolean> = {};
  notes.forEach((n) => (updated[n] = false));
  intervals.forEach((offset) => {
    const note = noteNames[(rootIndex + offset) % 12];
    updated[note] = true;
    updated[note + "'"] = true;
  });
  return updated;
}
