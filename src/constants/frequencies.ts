const NOTE_ORDER = [
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

export function calculateFrequencies(
  baseFrequency: number = 440
): Record<string, number> {
  const frequencies: Record<string, number> = {};
  const baseIndex = NOTE_ORDER.indexOf("A");

  NOTE_ORDER.forEach((note, i) => {
    const semitoneOffset = i - baseIndex;
    frequencies[note] = baseFrequency * Math.pow(2, semitoneOffset / 12);
    frequencies[note + "'"] = frequencies[note] * 2; // Octave higher
  });

  return frequencies;
}
