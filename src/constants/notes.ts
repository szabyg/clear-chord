export const NOTE_NAMES = [
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

export const getNotes = () => {
  return NOTE_NAMES.concat(NOTE_NAMES.map((n) => n + "'")).flat();
};
