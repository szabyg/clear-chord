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
      acc[note] = note === "C" || note === "E" || note === "G";
      return acc;
    },
    {} as Record<string, boolean>
  );
}
