"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MenorahProps {
    activeDay: number; // 0 (Sunday) to 6 (Shabbat)
    isIgniting?: boolean;
    className?: string;
}

export default function Menorah({ activeDay, isIgniting, className = "w-24" }: MenorahProps) {
    const getCandleColor = (candleNum: number) => {
        const litColor = "#D4A574"; // Warm bronze/gold
        const offColor = "#5C403C"; // Dark brown
        
        // Logic: 
        // 1st candle (rightmost) is lit on Sunday (0)
        // Saturday (6) -> all 7 candles lit
        // candleNum is 1 to 7 (left to right)
        // Sunday (0): only candle 7
        // Monday (1): candles 6, 7
        // ...
        
        if (candleNum >= (7 - activeDay)) return litColor;
        return offColor;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative mx-auto ${className}`}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 120 90" 
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(92, 64, 60, 0.2))' }}
            >
                {/* Architectural Base - Inspired by Synagogue Pediment */}
                <path 
                    d="M30,75 L30,82 L90,82 L90,75 L85,75 L85,70 L35,70 L35,75 Z" 
                    fill="none"
                    stroke="#5C403C"
                    strokeWidth="2"
                    strokeLinecap="square"
                />
                
                {/* Central Column - Stone Pillar */}
                <rect x="57" y="20" width="6" height="50" fill="none" stroke="#5C403C" strokeWidth="2"/>
                
                {/* Decorative Capital */}
                <path d="M54,20 L66,20 L66,18 L54,18 Z" fill="none" stroke="#5C403C" strokeWidth="1.5"/>

                {/* Right Branches - Architectural Arches */}
                <path d="M60,40 Q70,35 75,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
                <path d="M60,50 Q78,42 90,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
                <path d="M60,60 Q86,50 105,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>

                {/* Left Branches - Architectural Arches */}
                <path d="M60,40 Q50,35 45,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
                <path d="M60,50 Q42,42 30,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>
                <path d="M60,60 Q34,50 15,22" fill="none" stroke="#5C403C" strokeWidth="2" strokeLinecap="round"/>

                {/* Flame Holders - Etched Circles */}
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
        </motion.div>
    );
}
