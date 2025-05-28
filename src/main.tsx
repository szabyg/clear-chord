import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TriadTuner from "./TriadTuner";
import BeatFreeIntervals from "./BeatFreeIntervals";
import LandingPage from "./LandingPage";
import NotFound from "./NotFound";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/triad-tuner">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/free-tone-tuner" element={<TriadTuner />} />
        <Route path="/beat-free-intervals" element={<BeatFreeIntervals />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
