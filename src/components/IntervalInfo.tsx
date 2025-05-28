import React from "react";
import { IntervalName, INTERVALS } from "@/constants/intervals";
import { intervalUtils } from "@/utils/intervalUtils";

interface IntervalInfoProps {
  selectedInterval: IntervalName;
}

export function IntervalInfo({ selectedInterval }: IntervalInfoProps) {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Interval Information</h2>
      <p>
        <strong>Ratio:</strong> {INTERVALS[selectedInterval].ratio} (Just
        Intonation)
      </p>
      <p>
        <strong>Cents Difference:</strong>{" "}
        {intervalUtils.calculateCentsDifference(
          INTERVALS[selectedInterval].ratio,
          INTERVALS[selectedInterval].semitones
        ).toFixed(2)}{" "}
        cents from Equal Temperament
      </p>
    </div>
  );
}
