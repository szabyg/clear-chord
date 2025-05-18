export function detuneFrequency(baseFreq: number, cents: number): number {
  return baseFreq * Math.pow(2, cents / 1200);
}
