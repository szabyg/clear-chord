import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOscillators } from "@/hooks/useOscillators";
import {
  initializeDetuneCents,
  initializeActiveNotes,
} from "@/utils/noteUtils";

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
  const animationRef = useRef<number | null>(null);

  // Flag to prevent animation on initial load
  const initialLoadRef = useRef(true);
  // Flag to track if initialization effect has run
  const initEffectRanRef = useRef(false);

  // Track whether the update is from a slider adjustment
  const [isSliderAdjustment, setIsSliderAdjustment] = useState(false);

  const { startOscillators, stopOscillators, updateOscillators } =
    useOscillators(
      isPlaying,
      activeNotes,
      detuneCents,
      SLIDER_TRANSITION_TIME,
      targetDetuneCents,
      isSliderAdjustment
    );

  const tuneBeatFree = () => {
    // Ensure this is not treated as a slider adjustment
    setIsSliderAdjustment(false);

    // Keep the current active notes
    const currentActiveNotes = { ...activeNotes };

    // Find the lowest active note
    let lowestNoteIndex = -1;
    for (let i = 0; i < NOTE_NAMES.length; i++) {
      const note = NOTE_NAMES[i];
      if (currentActiveNotes[note] || currentActiveNotes[note + "'"]) {
        lowestNoteIndex = i;
        break;
      }
    }

    // If no active notes, do nothing
    if (lowestNoteIndex === -1) return;

    // Create new detune cents object starting with current values
    // This ensures inactive notes keep their current values
    const newDetuneCents = { ...detuneCents };

    // For each active note, calculate the beat-free interval based on its distance from the lowest note
    for (let i = 0; i < NOTE_NAMES.length; i++) {
      const note = NOTE_NAMES[i];

      // Skip inactive notes
      if (!currentActiveNotes[note] && !currentActiveNotes[note + "'"])
        continue;

      // Skip the lowest note (it's our reference)
      if (i === lowestNoteIndex) continue;

      // Calculate semitone distance from lowest note
      let semitones = i - lowestNoteIndex;
      if (semitones < 0) semitones += 12; // Wrap around for notes below the lowest

      // Find the closest just intonation interval
      let bestRatio = 1;
      let smallestDifference = Infinity;

      // Check all intervals to find the one that best matches this semitone distance
      for (const intervalName in INTERVALS) {
        if (Object.hasOwn(INTERVALS, intervalName)) {
          const interval = INTERVALS[intervalName as IntervalName];
          if (interval.semitones === semitones) {
            // Exact match found
            bestRatio = interval.ratio;
            break;
          }

          // Calculate how close this interval is to the desired semitone distance
          const difference = Math.abs(interval.semitones - semitones);
          if (difference < smallestDifference) {
            smallestDifference = difference;
            bestRatio = interval.ratio;
          }
        }
      }

      // Calculate the cent difference for this note
      const centsDifference = calculateCentsDifference(bestRatio, semitones);

      // Update the detune cents for this note
      newDetuneCents[note] = centsDifference;
    }

    // Set the target values to trigger animation
    setTargetDetuneCents(newDetuneCents);
  };

  const resetPitches = () => {
    // Ensure this is not treated as a slider adjustment
    setIsSliderAdjustment(false);

    // Create new detune cents object starting with initialDetunes
    // but keeping current values for inactive notes
    const newDetuneCents = { ...initialDetunes };
    for (const note of NOTE_NAMES) {
      if (!activeNotes[note] && !activeNotes[note + "'"]) {
        newDetuneCents[note] = detuneCents[note];
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
        // Skip inactive notes - don't animate them
        if (!activeNotes[note] && !activeNotes[note + "'"]) {
          newDetuneCents[note] = detuneCents[note];
          continue;
        }

        const startValue = startValues[note];
        const targetValue = targetDetuneCents[note];
        newDetuneCents[note] =
          startValue + (targetValue - startValue) * progress;
      }

      // Update state with intermediate values
      setDetuneCents(newDetuneCents);

      // Continue animation
      animationRef.current = requestAnimationFrame(animateSliders);
    };

    // Only start animation if target values are different from current values for active notes
    let needsAnimation = false;
    for (const note of NOTE_NAMES) {
      // Only check active notes
      if (
        (activeNotes[note] || activeNotes[note + "'"]) &&
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
      [note + "'"]: !prev[note + "'"],
    }));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Beat-Free Intervals</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-end gap-2">
            <Button onClick={togglePlayback}>
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button onClick={tuneBeatFree}>Tune Beat-Free</Button>
            <Button onClick={resetPitches}>Equal temperament</Button>
          </div>
        </div>

        {NOTE_NAMES.map((note) => (
          <div key={note} className="space-y-2">
            <label
              className={`block font-medium cursor-pointer ${activeNotes[note] || activeNotes[note + "'"] ? "text-black" : "text-gray-400"}`}
              onClick={() => toggleNote(note)}
            >
              {note} : {detuneCents[note].toFixed(2)} cents
            </label>
            <Slider
              min={-50.0}
              max={50.0}
              step={0.1}
              value={[detuneCents[note]]}
              disabled={!(activeNotes[note] || activeNotes[note + "'"])}
              onValueChange={([val]) => {
                // Set flag for immediate update
                setIsSliderAdjustment(true);

                // Update both current and target values for manual adjustments
                const newValue = { ...detuneCents, [note]: val };
                setDetuneCents(newValue);
                setTargetDetuneCents(newValue);

                // Reset flag after a short delay to ensure the update has been processed
                setTimeout(() => {
                  setIsSliderAdjustment(false);
                }, 50);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
