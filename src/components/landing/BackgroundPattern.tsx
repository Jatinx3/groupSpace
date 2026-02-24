"use client";

import { useId } from "react";

type PatternVariant = "grid" | "dots" | "architectural";

interface BackgroundPatternProps {
  variant?: PatternVariant;
  className?: string;
  opacity?: number;
}

export function BackgroundPattern({
  variant = "architectural",
  className = "",
  opacity = 0.03,
}: BackgroundPatternProps) {
  const id = useId();

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === "grid" && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      )}

      {variant === "dots" && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      )}

      {variant === "architectural" && (
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={id} width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 100 V 50 H 50 V 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <rect x="60" y="60" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="20" cy="20" r="2" fill="currentColor" />
              <path d="M80 20 L 100 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      )}
    </div>
  );
}
