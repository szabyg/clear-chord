import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Tone Tuner</h1>
        <p className="text-xl">
          A simple tool to help you tune and experiment with musical tones and
          chords.
        </p>
        <div className="py-4 flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/free-tone-tuner">
            <Button className="text-lg px-6 py-3 w-full md:w-auto">
              Try the Free Tone Tuner
            </Button>
          </Link>
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
            <li>• Apply different chord types</li>
            <li>• Explore beat-free intervals with just intonation</li>
            <li>• Toggle notes on and off</li>
            <li>• Play and hear your tunings in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
