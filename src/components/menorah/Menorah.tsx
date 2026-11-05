'use client';

import React, { useId, useRef } from 'react';
import { DAY_NAMES_HE } from '@/lib/dates';

interface MenorahProps {
    /**
     * How far into the week we are: 0 (Sunday) ... 6 (Shabbat).
     * Every candle up to and including this one is lit. Use 6 for a past week.
     */
    litThrough: number;
    /** Per day (0..6): how many of the three moments were done (0..3). The flame grows with each. */
    levels?: number[];
    /** Highlights one day's candle (e.g. the day being viewed). */
    selected?: number | null;
    onSelect?: (day: number) => void;
    /** Long press anywhere on the menorah: opens "the secret of the menorah". */
    onLongPress?: () => void;
    className?: string;
    /** Draw the tiny day names under the cups. */
    showDayNames?: boolean;
}

// Sunday is the rightmost candle; the week is read right to left, like Hebrew.
const CUP_X = [105, 90, 75, 60, 45, 30, 15];
const CUP_Y = 30;
const DAY_LETTERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", 'ש'];
const MIDDLE = 3; // Wednesday: the day the lights were made

export default function Menorah({
    litThrough,
    levels = [],
    selected = null,
    onSelect,
    onLongPress,
    className = 'w-28',
    showDayNames = false,
}: MenorahProps) {
    const uid = useId().replace(/:/g, '');
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressed = useRef(false);

    const startPress = () => {
        if (!onLongPress) return;
        longPressed.current = false;
        pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            onLongPress();
        }, 650);
    };
    const endPress = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
    };

    const select = (d: number) => {
        if (longPressed.current) return;
        onSelect?.(d);
    };

    return (
        <svg
            viewBox={`0 0 120 ${showDayNames ? 104 : 96}`}
            className={`${className} h-auto text-metal select-none overflow-visible`}
            role="group"
            aria-label="מנורת השבוע"
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onContextMenu={(e) => onLongPress && e.preventDefault()}
        >
            <defs>
                <radialGradient id={`flame-${uid}`} cx="50%" cy="72%" r="65%">
                    <stop offset="0" stopColor="var(--flame-core)" />
                    <stop offset="0.45" stopColor="var(--flame-bright)" />
                    <stop offset="1" stopColor="var(--flame)" stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id={`halo-${uid}`}>
                    <stop offset="0" stopColor="var(--flame-bright)" stopOpacity="0.55" />
                    <stop offset="1" stopColor="var(--flame-bright)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Body: base, stem and the six arms */}
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M30,85 L30,92 L90,92 L90,85 L85,85 L85,80 L35,80 L35,85 Z" />
                <rect x="57" y={CUP_Y} width="6" height="50" />
                <path d={`M60,50 Q70,45 75,${CUP_Y + 2}`} />
                <path d={`M60,60 Q78,52 90,${CUP_Y + 2}`} />
                <path d={`M60,70 Q86,60 105,${CUP_Y + 2}`} />
                <path d={`M60,50 Q50,45 45,${CUP_Y + 2}`} />
                <path d={`M60,60 Q42,52 30,${CUP_Y + 2}`} />
                <path d={`M60,70 Q34,60 15,${CUP_Y + 2}`} />
            </g>

            {CUP_X.map((x, day) => {
                const lit = day <= litThrough;
                const level = Math.max(0, Math.min(3, levels[day] || 0));
                const scale = 0.72 + level * 0.16; // a lit candle is always on; each moment feeds it
                const isSelected = selected === day;
                const label = `${day === 6 ? 'שבת' : `יום ${DAY_NAMES_HE[day]}`}${lit ? `, ${level} מתוך 3 רגעים` : ''}`;

                return (
                    <g
                        key={day}
                        role={onSelect ? 'button' : undefined}
                        tabIndex={onSelect ? 0 : undefined}
                        aria-label={label}
                        aria-pressed={onSelect ? isSelected : undefined}
                        onClick={() => select(day)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelect?.(day);
                            }
                        }}
                        style={{ cursor: onSelect ? 'pointer' : undefined, outline: 'none' }}
                    >
                        {/* generous invisible hit area */}
                        <rect x={x - 7.5} y={0} width={15} height={CUP_Y + 10} fill="transparent" />

                        {lit && day === MIDDLE && (
                            <circle cx={x} cy={CUP_Y - 9} r={13} fill={`url(#halo-${uid})`} opacity={0.75} />
                        )}
                        {lit && level === 3 && day !== MIDDLE && (
                            <circle cx={x} cy={CUP_Y - 9} r={9} fill={`url(#halo-${uid})`} opacity={0.5} />
                        )}

                        {lit && (
                            <g transform={`translate(${x} ${CUP_Y - 3}) scale(${scale})`}>
                                <path
                                    className="flame"
                                    d="M0,-17 C4.5,-10 5,-4 0,0 C-5,-4 -4.5,-10 0,-17 Z"
                                    fill={`url(#flame-${uid})`}
                                    style={{ animationDelay: `${day * 0.37}s` }}
                                />
                            </g>
                        )}

                        <circle cx={x} cy={CUP_Y} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx={x} cy={CUP_Y} r="3" fill={lit ? 'var(--flame)' : 'currentColor'} opacity={lit ? 1 : 0.55} />

                        {isSelected && (
                            <circle cx={x} cy={CUP_Y} r="8" fill="none" stroke="var(--accent-active)" strokeWidth="1.2" />
                        )}

                        {showDayNames && (
                            <text
                                x={x}
                                y={101}
                                textAnchor="middle"
                                fontSize="6"
                                fill="currentColor"
                                opacity={isSelected ? 1 : 0.6}
                                fontWeight={isSelected ? 700 : 400}
                            >
                                {DAY_LETTERS[day]}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
