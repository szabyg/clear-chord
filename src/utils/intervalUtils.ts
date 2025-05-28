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

export const intervalUtils = {
  ratioCents,
  calculateCentsDifference,
};
