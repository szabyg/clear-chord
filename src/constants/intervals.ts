export type IntervalName =
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

export const INTERVALS: Record<IntervalName, { ratio: number; semitones: number }> = {
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
