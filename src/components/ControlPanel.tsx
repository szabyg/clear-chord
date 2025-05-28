import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onResetPitches: () => void;
  children?: ReactNode;
}

export function ControlPanel({
  isPlaying,
  onTogglePlayback,
  onResetPitches,
  children,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex flex-wrap items-end gap-2">
        {children && (
          <>
            {/* This is where action buttons specific to each component will go */}
            {React.Children.map(children, (child) => child)}
          </>
        )}
        <Button onClick={onResetPitches}>Equal temperament</Button>
        <Button onClick={onTogglePlayback}>
          {isPlaying ? "Stop" : "Play"}
        </Button>
      </div>
    </div>
  );
}
