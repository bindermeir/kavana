"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MenorahProps {
    activeDay: number; // 1 (Sunday) to 7 (Shabbat)
    isIgniting?: boolean;
    className?: string;
}

export default function Menorah({ activeDay, isIgniting, className = "w-24" }: MenorahProps) {
    // X Coordinates for the 7 Cups
    const candlePositions = [60, 90, 120, 150, 180, 210, 240];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative mx-auto ${className}`}
            style={{ aspectRatio: '300/220' }}
        >
            <svg viewBox="0 0 300 220" className="absolute top-0 left-0 w-full h-full drop-shadow-lg">
                <defs>
                    {/* Updated gradient to match new indigo/gold palette */}
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="40%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#fef3c7" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* --- Structure --- */}

                {/* Base */}
                <path d="M85 200 L 215 200 L 195 180 H 105 L 85 200" fill="url(#goldGradient)" />
                <path d="M105 180 L 115 170 H 185 L 195 180" fill="url(#goldGradient)" opacity="0.8" />

                {/* Curved Branches */}
                <path d="M60 50 V 120 Q 60 165 150 165" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M240 50 V 120 Q 240 165 150 165" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M90 50 V 105 Q 90 140 150 140" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M210 50 V 105 Q 210 140 150 140" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M120 50 V 90 Q 120 115 150 115" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />
                <path d="M180 50 V 90 Q 180 115 150 115" fill="none" stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round" />

                {/* Central Pillar */}
                <path d="M150 200 V 50" fill="none" stroke="url(#goldGradient)" strokeWidth="12" strokeLinecap="butt" />

                {/* Cups */}
                {candlePositions.map(x => (
                    <g key={x}>
                        <path d={`M${x - 15} 50 Q ${x} 68 ${x + 15} 50 Z`} fill="#818cf8" />
                        <ellipse cx={x} cy="50" rx="15" ry="4" fill="#a5b4fc" />
                    </g>
                ))}
            </svg>

            {/* --- Flames --- */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {candlePositions.map((x, index) => {
                    const isLit = index >= (7 - activeDay);
                    const isNewFlame = isIgniting && index === (7 - activeDay);

                    return (
                        <div
                            key={index}
                            className="absolute transform -translate-x-1/2 -translate-y-full"
                            style={{
                                left: `${(x / 300) * 100}%`,
                                top: `${(50 / 220) * 100}%`,
                                marginTop: '1px'
                            }}
                        >
                            {isLit && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: isNewFlame ? [1, 1.5, 1] : 1,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: (6 - index) * 0.1,
                                        ease: "easeOut"
                                    }}
                                    className="origin-bottom"
                                >
                                    {/* Flame glow */}
                                    <div className="absolute -inset-2 bg-amber-400/30 rounded-full blur-md animate-pulse" />

                                    {/* Main flame */}
                                    <div
                                        className="relative w-3 h-5 rounded-[50%_50%_50%_50%_/_70%_70%_30%_30%]"
                                        style={{
                                            background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fef9c3)',
                                            boxShadow: '0 -4px 8px rgba(251, 191, 36, 0.5), 0 0 12px rgba(251, 191, 36, 0.3)'
                                        }}
                                    />

                                    {/* Blue core */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400/60 rounded-full blur-[1px]" />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
