import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
