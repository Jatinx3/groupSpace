"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  align?: "left" | "center";
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = "md", 
  showText = true,
  align = "left" 
}) => {
  const sizes = {
    sm: { h: 18, text: "text-[15px]", sub: "text-[8px]" },
    md: { h: 24, text: "text-[20px]", sub: "text-[10px]" },
    lg: { h: 36, text: "text-[30px]", sub: "text-[14px]" },
    xl: { h: 48, text: "text-[40px]", sub: "text-[18px]" },
  };

  const c = sizes[size];

  return (
    <div className={`flex flex-col justify-center select-none ${align === "center" ? "items-center" : "items-start"} ${className}`} style={{ height: c.h * 1.6 }}>
      {showText ? (
        <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start"}`}>
          {/* Line 1: collably (Ultra-bold Sans) */}
          <div 
            className={`${c.text} font-[950] tracking-[-0.05em] text-gray-900 dark:text-white leading-[0.75]`}
            style={{ fontFamily: '"Inter", "system-ui", sans-serif' }}
          >
            collably
          </div>
          
          {/* Line 2: .space (Tech/Monospace with Square Dot) */}
          <div className={`flex items-end gap-0.5 mt-[-1px] ${align === "center" ? "" : "ml-4"}`}>
            {/* Square Dot (Pixel) */}
            <div 
              className="bg-gray-900 dark:bg-white shrink-0" 
              style={{ 
                width: Math.max(2, c.h / 12), 
                height: Math.max(2, c.h / 12),
                marginBottom: Math.max(1, c.h / 20)
              }} 
            />
            <div 
              className={`${c.sub} font-bold tracking-[-0.02em] text-gray-900 dark:text-white leading-none opacity-80`}
              style={{ fontFamily: '"JetBrains Mono", "ui-monospace", "SFMono-Regular", Menlo, Monaco, Consolas, monospace' }}
            >
              space
            </div>
          </div>
        </div>
      ) : (
        /* MINI LOGO (for collapsed sidebars) */
        <div className="flex items-end gap-0.5">
          <div 
            className={`${c.text} font-[950] tracking-tighter text-gray-900 dark:text-white leading-[0.75]`}
            style={{ fontFamily: '"Inter", "system-ui", sans-serif' }}
          >
            c
          </div>
          <div 
            className="bg-gray-900 dark:bg-white shrink-0 mb-[1px]" 
            style={{ 
              width: Math.max(3, c.h / 8), 
              height: Math.max(3, c.h / 8) 
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default Logo;
