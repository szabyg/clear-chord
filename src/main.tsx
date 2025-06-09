import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BeatFreeIntervals from "./BeatFreeIntervals";
import LandingPage from "./LandingPage";
import NotFound from "./NotFound";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/clear-chord/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/beat-free-intervals" element={<BeatFreeIntervals />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
