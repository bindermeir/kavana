"use client";

import React from 'react';
import { getDay } from 'date-fns';

export default function Menorah() {
  const dayOfWeek = getDay(new Date()); // 0 (Sun) to 6 (Sat)

  const getCandleColor = (candleNum: number) => {
    const litColor = "#D4A574"; // Warm bronze/gold
    const offColor = "#5C403C"; // Dark brown
    
    // Logic: 
    // Sunday (0) -> 1st candle (rightmost, index 7)
    // Monday (1) -> 2nd candle (index 6)
    // ...
    // Saturday (6) -> All lit
    
    if (candleNum > (7 - dayOfWeek)) return litColor;
    if (candleNum === (7 - dayOfWeek)) return litColor;
    
    return offColor;
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 90" 
      width="80" 
      height="60"
      className="flex-shrink-0"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(92, 64, 60, 0.2))' }}
    >
      {/* Architectural Base */}
      <path 
        d="M30,75 L30,82 L90,82 L90,75 L85,75 L85,70 L35,70 L35,75 Z" 
        fill="none"
        stroke="#5C403C"
        strokeWidth="2"
        strokeLinecap="square"
      />
      
      {/* Central Column */}
      <rect x="57" y="20" width="6" height="50" fill="none" stroke="#5C403C" strokeWidth="2"/>
      
      {/* Decorative Capital */}
      <path d="M54,20 L66,20 L66,18 L54,18 Z" fill="none" stroke="#5C403C" strokeWidth="1.5"/>

      {/* Right Branches */}
      <path d="M60,40 Q70,35 75,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60,50 Q78,42 90,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60,60 Q86,50 105,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>

      {/* Left Branches */}
      <path d="M60,40 Q50,35 45,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60,50 Q42,42 30,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M60,60 Q34,50 15,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>

      {/* Flame Holders & Flames */}
      <g>
        {[15, 30, 45, 60, 75, 90, 105].map((x, i) => {
          const candleNum = i + 1;
          const color = getCandleColor(candleNum);
          const isLit = color === "#D4A574";
          
          return (
            <g key={x}>
              <circle cx={x} cy="20" r="5" fill="none" stroke="#5C403C" strokeWidth="1.5"/>
              <circle 
                cx={x} 
                cy="20" 
                r="3" 
                fill={color} 
                className={isLit ? "flame-breathe" : ""} 
                style={{ transition: 'fill 1s ease' }}
              />
            </g>
          );
        })}
      </g>

      {/* Decorative Details */}
      <path d="M30,68 L32,68 L32,66 L34,66 L34,68 L36,68" fill="none" stroke="#5C403C" strokeWidth="1"/>
      <path d="M84,68 L86,68 L86,66 L88,66 L88,68 L90,68" fill="none" stroke="#5C403C" strokeWidth="1"/>
    </svg>
  );
}
