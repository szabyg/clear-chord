import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold">Welcome to ClearChord</h1>
        <p className="text-xl">
          A simple tool to help you tune and experiment with musical tones.
        </p>

        <div className="mt-6 bg-gray-50 p-6 rounded-lg text-left">
          <h2 className="text-2xl font-semibold mb-3">
            Understanding Tuning Systems
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">Equal Temperament</h3>
              <p>
                Equal temperament is the standard tuning system used in most
                modern Western music. It divides the octave into 12 equal
                semitones, each exactly 100 cents apart. This creates a
                mathematically consistent system that allows music to be played
                in any key without retuning, but it introduces slight
                imperfections in the harmonic relationships between notes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium">
                Just Intonation (Natural Intervals)
              </h3>
              <p>
                Just intonation uses intervals based on simple whole-number
                ratios found in the natural harmonic series. These "pure" or
                "beat-free" intervals sound exceptionally harmonious because
                their sound waves align perfectly, eliminating the acoustic
                beats or wavering sounds that occur in equal temperament. For
                example, a perfect fifth in just intonation has a frequency
                ratio of exactly 3:2, while in equal temperament it's slightly
                different at 2^(7/12).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium">The Difference</h3>
              <p>
                The difference between these systems is measurable in "cents"
                (1/100th of a semitone). While equal temperament allows for easy
                modulation between keys, just intonation provides more consonant
                harmonies within a single key. ClearChord lets you explore these
                differences by hearing and adjusting intervals in real-time,
                helping you understand how these tuning systems affect the sound
                of musical intervals.
              </p>
            </div>
          </div>
        </div>

        <div className="py-4 flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/beat-free-intervals">
            <Button className="text-lg px-6 py-3 w-full md:w-auto">
              Explore Beat-Free Intervals
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-left max-w-md mx-auto">
            <li>• Tune individual notes with cent precision</li>
            <li>• Explore beat-free intervals with just intonation</li>
            <li>• Toggle notes on and off</li>
            <li>• Play and hear your tunings in real-time</li>
            <li>
              • Auto-tune gradually to a beat-free tuning (based on the deepest
              note)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
