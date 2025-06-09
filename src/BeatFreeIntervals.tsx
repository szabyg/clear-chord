import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOscillators } from "@/hooks/useOscillators";
import {
  initializeDetuneCents,
  initializeActiveNotes,
} from "@/utils/noteUtils";
import { Play, Pause, Music, Equal, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";

const NOTE_NAMES = [
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

type IntervalName =
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
  | "Minor Seventh"
  | "Triton";

const INTERVALS: Record<IntervalName, { ratio: number; semitones: number }> = {
  "Minor Second": { ratio: 16 / 15, semitones: 1 },
  "Major Second": { ratio: 9 / 8, semitones: 2 },
  "Minor Third": { ratio: 6 / 5, semitones: 3 },
  "Major Third": { ratio: 5 / 4, semitones: 4 },
  "Perfect Fourth": { ratio: 4 / 3, semitones: 5 },
  Triton: {
    ratio: 45 / 32,
    semitones: 6,
  },
  "Perfect Fifth": { ratio: 3 / 2, semitones: 7 },
  "Minor Sixth": { ratio: 8 / 5, semitones: 8 },
  "Major Sixth": { ratio: 5 / 3, semitones: 9 },
  "Minor Seventh": { ratio: 16 / 9, semitones: 10 },
  "Major Seventh": { ratio: 15 / 8, semitones: 11 },
  "Perfect Octave": { ratio: 2 / 1, semitones: 12 },
};

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

// Helper function to check if a note is active
const isNoteActive = (note: string, activeNotes: Record<string, boolean>): boolean =>
  Boolean(activeNotes[note]);

// Helper function to find the lowest active note
const findLowestActiveNote = (noteNames: string[], activeNotes: Record<string, boolean>) => {
  // First check base notes
  for (let i = 0; i < noteNames.length; i++) {
    const note = noteNames[i];
    if (note !== undefined && isNoteActive(note, activeNotes)) {
      return { index: i, isOctave: false };
    }
  }

  // Then check octave notes
  for (let i = 0; i < noteNames.length; i++) {
    const note = noteNames[i];
    if (note !== undefined && isNoteActive(note + "'", activeNotes)) {
      return { index: i, isOctave: true };
    }
  }

  return null; // No active notes found
};

// Helper function to find the best matching interval
const findBestMatchingInterval = (semitones: number, intervals: typeof INTERVALS) => {
  // Convert intervals to array for easier processing
  const intervalsArray = Object.entries(intervals).map(([name, data]) => ({
    name,
    ...data
  }));

  // Try to find exact match first (using modulo 12 to handle octaves)
  const exactMatch = intervalsArray.find(interval =>
    interval.semitones === semitones % 12
  );

  if (exactMatch) return exactMatch.ratio;

  // Find closest match if no exact match found
  return intervalsArray
    .reduce((closest, current) => {
      const currentDiff = Math.abs(current.semitones - semitones);
      const closestDiff = Math.abs(closest.semitones - semitones);

      return currentDiff < closestDiff ? current : closest;
    }).ratio;
};

export default function BeatFreeIntervals() {
  const initialDetunes = initializeDetuneCents(NOTE_NAMES);
  const NOTES = NOTE_NAMES.concat(NOTE_NAMES.map((n) => n + "'")).flat();
  const initialActives = initializeActiveNotes(NOTES);
  const SLIDER_TRANSITION_TIME = 2000;

  const [detuneCents, setDetuneCents] = useLocalStorageState(
    "beatFreeDetuneCents",
    initialDetunes
  );
  const [targetDetuneCents, setTargetDetuneCents] =
    useState<Record<string, number>>(initialDetunes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useLocalStorageState(
    "beatFreeActiveNotes",
    initialActives
  );
  const [showSecondOctave, setShowSecondOctave] = useLocalStorageState(
    "beatFreeShowSecondOctave",
    false
  );
  const animationRef = useRef<number | null>(null);

  // Flag to prevent animation on initial load
  const initialLoadRef = useRef(true);
  // Flag to track if initialization effect has run
  const initEffectRanRef = useRef(false);

  // Track whether the update is from a slider adjustment
  const [isSliderAdjustment, setIsSliderAdjustment] = useState(false);

  const { startOscillators, stopOscillators, updateOscillators } =
    useOscillators(
      activeNotes,
      detuneCents,
      SLIDER_TRANSITION_TIME,
      targetDetuneCents,
      isSliderAdjustment
    );

  const tuneBeatFree = () => {
    // Ensure this is not treated as a slider adjustment
    setIsSliderAdjustment(false);

    // Find the lowest active note
    const lowestNote = findLowestActiveNote(NOTE_NAMES, activeNotes);
    if (!lowestNote) return; // No active notes, do nothing

    // Create new detune cents object starting with current values
    const newDetuneCents = { ...detuneCents };

    // Calculate beat-free intervals for each note
    NOTE_NAMES.forEach((baseNote, i) => {
      const octaveNote = baseNote + "'";
      const isBaseActive = isNoteActive(baseNote, activeNotes);
      const isOctaveActive = isNoteActive(octaveNote, activeNotes);

      // Skip notes that are not active in either octave
      if (!isBaseActive && !isOctaveActive) return;

      // Skip the lowest note (it's our reference)
      if (i === lowestNote.index && (!lowestNote.isOctave || !isBaseActive)) return;

      // Calculate semitone distance from lowest note
      let semitones = i - lowestNote.index;
      if (semitones < 0) semitones += 12; // Wrap around for notes below the lowest

      // Find the best matching interval and calculate cents difference
      const bestRatio = findBestMatchingInterval(semitones, INTERVALS);
      const centsDifference = calculateCentsDifference(bestRatio, semitones);

      // Update the detune cents for the base note
      if (baseNote in newDetuneCents) {
        newDetuneCents[baseNote] = centsDifference;
      }
    });

    // Set the target values to trigger animation
    setTargetDetuneCents(newDetuneCents);
  };

  const resetPitches = () => {
    // Ensure this is not treated as a slider adjustment
    setIsSliderAdjustment(false);

    // Create new detune cents object starting with initialDetunes
    // but keeping current values for inactive notes
    const newDetuneCents = { ...initialDetunes };

    // Process base notes
    for (const note of NOTE_NAMES) {
      const octaveNote = note + "'";

      // If neither the base note nor its octave is active, keep the current value
      if (activeNotes[note] !== true && activeNotes[octaveNote] !== true) {
        const currentValue = detuneCents[note];
        if (currentValue !== undefined && note in newDetuneCents) {
          newDetuneCents[note] = currentValue;
        }
      }
    }

    // Set the target values to trigger animation
    setTargetDetuneCents(newDetuneCents);
  };

  useEffect(() => {
    if (isPlaying) {
      startOscillators();
    } else {
      stopOscillators();
    }
  }, [isPlaying]);

  // Initialize targetDetuneCents with current detuneCents on mount
  useEffect(() => {
    // Only run this effect once
    if (!initEffectRanRef.current) {
      setTargetDetuneCents(detuneCents);
      // Set initialLoadRef to false after a small delay to ensure
      // the initial render is complete
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
      initEffectRanRef.current = true;
    }
  }, [detuneCents]);

  // Effect to update oscillators when active notes change
  useEffect(() => {
    if (isPlaying) {
      updateOscillators();
    }
  }, [activeNotes]);

  // Effect to update oscillators when target detune cents change
  useEffect(() => {
    if (isPlaying) {
      // Update oscillators immediately when target changes
      // This ensures audio transition starts at the same time as slider animation
      updateOscillators();
    }
  }, [targetDetuneCents]);

  // Animation effect for slider movement
  useEffect(() => {
    // Skip animation on initial load
    if (initialLoadRef.current) {
      setDetuneCents(targetDetuneCents);
      return;
    }

    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start time of the animation
    const startTime = performance.now();
    // Starting values of detune cents
    const startValues = { ...detuneCents };

    // Animation function
    const animateSliders = (currentTime: number) => {
      // Calculate elapsed time
      const elapsedTime = currentTime - startTime;

      // Calculate progress (0 to 1)
      const progress = Math.min(elapsedTime / SLIDER_TRANSITION_TIME, 1);

      // If animation is complete
      if (progress === 1) {
        setDetuneCents(targetDetuneCents);
        animationRef.current = null;
        return;
      }

      // Calculate intermediate values for each note
      const newDetuneCents = { ...detuneCents };
      for (const note of NOTE_NAMES) {
        const octaveNote = note + "'";

        // Skip notes that are not active in either octave
        if (activeNotes[note] !== true && activeNotes[octaveNote] !== true) {
          const currentValue = detuneCents[note];
          if (currentValue !== undefined && note in newDetuneCents) {
            newDetuneCents[note] = currentValue;
          }
          continue;
        }

        const startValue = startValues[note];
        const targetValue = targetDetuneCents[note];

        // Ensure both values are defined before calculating
        if (
          startValue !== undefined &&
          targetValue !== undefined &&
          note in newDetuneCents
        ) {
          newDetuneCents[note] =
            startValue + (targetValue - startValue) * progress;
        }
      }

      // Update state with intermediate values
      setDetuneCents(newDetuneCents);

      // Continue animation
      animationRef.current = requestAnimationFrame(animateSliders);
    };

    // Only start animation if target values are different from current values for active notes
    let needsAnimation = false;
    for (const note of NOTE_NAMES) {
      const octaveNote = note + "'";

      // Check if either the base note or its octave is active
      if (
        (activeNotes[note] || activeNotes[octaveNote]) &&
        detuneCents[note] !== targetDetuneCents[note]
      ) {
        needsAnimation = true;
        break;
      }
    }

    if (needsAnimation) {
      animationRef.current = requestAnimationFrame(animateSliders);
    } else {
      // If no animation needed, just update the values
      setDetuneCents(targetDetuneCents);
    }

    // Cleanup function
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetDetuneCents, activeNotes]);

  const toggleNote = (note: string) => {
    setActiveNotes((prev) => ({
      ...prev,
      [note]: !prev[note],
    }));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleSecondOctave = () => {
    setShowSecondOctave(!showSecondOctave);
  };

  const resetAll = () => {
    // Stop any playing sound
    setIsPlaying(false);

    // Reset all sliders to their default values
    setDetuneCents(initialDetunes);
    setTargetDetuneCents(initialDetunes);

    // Reset all active notes to their default state
    setActiveNotes(initialActives);

    // Ensure this is not treated as a slider adjustment
    setIsSliderAdjustment(false);

    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Beat-Free Intervals</h1>
          <Link to="/" className="hover:opacity-80">
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-end gap-2">
            <Button onClick={togglePlayback}>
              {isPlaying ? <Pause /> : <Play />}
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button onClick={tuneBeatFree}>
              <Music />
              Tune Beat-Free
            </Button>
            <Button onClick={resetPitches}>
              <Equal />
              Equal temperament
            </Button>
            <Button onClick={toggleSecondOctave}>
              {showSecondOctave ? <ChevronUp /> : <ChevronDown />}
              {showSecondOctave ? "Hide 2nd Octave" : "Show 2nd Octave"}
            </Button>
            <Button onClick={resetAll} variant="destructive">
              <RefreshCcw />
              Reset All
            </Button>
          </div>
        </div>

        {NOTES.filter(note => !note.includes("'") || showSecondOctave).map((note) => (
          <div key={note} className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant={activeNotes[note] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleNote(note)}
                className={`min-w-[40px] h-6 px-2 text-xs rounded-full ${
                  activeNotes[note] ? "bg-green-500 hover:bg-green-600" : ""
                }`}
              >
                {note}
              </Button>
              <span className="font-medium">
                {(detuneCents[note.replace("'", "")] ?? 0).toFixed(2)} cents
              </span>
            </div>
            <Slider
              min={-50.0}
              max={50.0}
              step={0.1}
              value={[detuneCents[note.replace("'", "")] ?? 0]}
              disabled={activeNotes[note] !== true}
              onValueChange={([val]) => {
                // Set flag for immediate update
                setIsSliderAdjustment(true);

                // Update both current and target values for manual adjustments
                const baseNote = note.replace("'", "");

                // Create type-safe copies of the state
                const newDetuneCents = { ...detuneCents };
                const newTargetDetuneCents = { ...targetDetuneCents };

                // Safely update the values
                if (
                  typeof baseNote === "string" &&
                  baseNote in newDetuneCents
                ) {
                  // val is a number from the slider, so it's safe to assign
                  newDetuneCents[baseNote] = val as number;
                }

                if (
                  typeof baseNote === "string" &&
                  baseNote in newTargetDetuneCents
                ) {
                  // val is a number from the slider, so it's safe to assign
                  newTargetDetuneCents[baseNote] = val as number;
                }

                // Update state
                setDetuneCents(newDetuneCents);
                setTargetDetuneCents(newTargetDetuneCents);

                // Reset flag after a short delay to ensure the update has been processed
                setTimeout(() => {
                  setIsSliderAdjustment(false);
                }, 50);
              }}
            />
          </div>
        ))}
      </div>
      <footer className="mt-8 py-4 border-t w-full text-center text-gray-600">
        <div className="flex justify-center items-center gap-2 mb-2">
          <a href="https://github.com/szabyg/clear-chord" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            GitHub
          </a>
        </div>
        <div>Author: Szabolcs Grünwald</div>
      </footer>
    </div>
  );
}
