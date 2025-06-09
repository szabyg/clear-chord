# ClearChord

ClearChord is a web application that helps musicians and audio enthusiasts tune and experiment with musical tones. It focuses on exploring different tuning systems, particularly Equal Temperament and Just Intonation, allowing users to hear and understand the differences between these systems in real-time.

## Features

- Tune individual notes with cent precision
- Explore beat-free intervals with just intonation
- Toggle notes on and off
- Play and hear your tunings in real-time
- Auto-tune gradually to a beat-free tuning (based on the deepest note)

## Understanding Tuning Systems

### Equal Temperament

Equal temperament is the standard tuning system used in most modern Western music. It divides the octave into 12 equal semitones, each exactly 100 cents apart. This creates a mathematically consistent system that allows music to be played in any key without retuning, but it introduces slight imperfections in the harmonic relationships between notes.

### Just Intonation (Natural Intervals)

Just intonation uses intervals based on simple whole-number ratios found in the natural harmonic series. These "pure" or "beat-free" intervals sound exceptionally harmonious because their sound waves align perfectly, eliminating the acoustic beats or wavering sounds that occur in equal temperament. For example, a perfect fifth in just intonation has a frequency ratio of exactly 3:2, while in equal temperament it's slightly different at 2^(7/12).

### The Difference

The difference between these systems is measurable in "cents" (1/100th of a semitone). While equal temperament allows for easy modulation between keys, just intonation provides more consonant harmonies within a single key. ClearChord lets you explore these differences by hearing and adjusting intervals in real-time, helping you understand how these tuning systems affect the sound of musical intervals.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/szabyg/clear-chord.git
   cd clear-chord
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Building for Production

To build the application for production:

```
npm run build
```

To preview the production build:

```
npm run preview
```

## Deployment

To deploy to GitHub Pages:

```
npm run deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Szabolcs Grünwald

## Links

- [GitHub Repository](https://github.com/szabyg/clear-chord)
