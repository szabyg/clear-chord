import React from "react";
import { Slider } from "@/components/ui/slider";

interface NoteSliderProps {
  note: string;
  detuneCents: number;
  isActive: boolean;
  onToggle: (note: string) => void;
  onValueChange: (value: number) => void;
}

export function NoteSlider({
  note,
  detuneCents,
  isActive,
  onToggle,
  onValueChange,
}: NoteSliderProps) {
  return (
    <div className="space-y-2">
      <label
        className={`block font-medium cursor-pointer ${
          isActive ? "text-black" : "text-gray-400"
        }`}
        onClick={() => onToggle(note)}
      >
        {note} : {detuneCents} cents
      </label>
      <Slider
        min={-50.0}
        max={50.0}
        step={0.1}
        value={[detuneCents]}
        disabled={!isActive}
        onValueChange={([val]) => onValueChange(val)}
      />
    </div>
  );
}
