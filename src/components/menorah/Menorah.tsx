'use client';

import React, { useId, useRef } from 'react';
import { DAY_NAMES_HE, isEveningHour } from '@/lib/dates';

/**
 * The menorah is the week's clock (see PHILOSOPHY.md, "נר תמיד").
 * Shape: the round branches of the Arch of Titus, without the base: only branches and flames.
 *
 * A day's candle:
 * - past day: lit; its flame grows with the moments that were done (0..3)
 * - today: lit once shacharit is done, and by itself in the evening
 *   ("הנר נדלק בערב בכל מקרה"); before that a ready wick waits in the cup
 * - Sunday's candle, the western one, is never out ("ממנה היה מדליק")
 * - future day: an empty cup
 */
export interface MenorahProps {
    /** The last day of the week that has arrived, 0 (Sunday) ... 6 (Shabbat). Use 6 for a past week, -1 for a future one. */
    litThrough: number;
    /** Which day is today, or null when showing a past week. */
    todayIndex?: number | null;
    /** Moments done per day (0..3). */
    levels?: number[];
    /** Evening lights today's candle even without any moment. Defaults to the current hour. */
    evening?: boolean;
    selected?: number | null;
    onSelect?: (day: number) => void;
    /** Long press anywhere: "the secret of the menorah". */
    onLongPress?: () => void;
    className?: string;
    showDayNames?: boolean;
}

// Sunday is the rightmost candle; the week reads right to left.
const CUP_X = [105, 90, 75, 60, 45, 30, 15];
const CUP_Y = 26;
const MIDDLE = 3; // Wednesday: the day the lights were made
const DAY_LETTERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", 'ש'];

export type CandleState = 'future' | 'ready' | 'lit';

export function candleState(day: number, litThrough: number, todayIndex: number | null | undefined, level: number, evening: boolean): CandleState {
    if (day > litThrough) return 'future';
    if (day !== todayIndex) return 'lit';
    if (day === 0 || level > 0 || evening) return 'lit';
    return 'ready';
}

export default function Menorah({
    litThrough,
    todayIndex = null,
    levels = [],
    evening,
    selected = null,
    onSelect,
    onLongPress,
    className = 'w-28',
    showDayNames = false,
}: MenorahProps) {
    const uid = useId().replace(/:/g, '');
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressed = useRef(false);
    const isEvening = evening ?? isEveningHour(new Date().getHours());

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

    return (
        <svg
            viewBox={`0 0 120 ${showDayNames ? 88 : 76}`}
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
                    <stop offset="0.5" stopColor="var(--flame-bright)" />
                    <stop offset="1" stopColor="var(--flame)" stopOpacity="0.12" />
                </radialGradient>
                <radialGradient id={`halo-${uid}`}>
                    <stop offset="0" stopColor="var(--flame-bright)" stopOpacity="0.45" />
                    <stop offset="1" stopColor="var(--flame-bright)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* The branches of the Arch of Titus, no base */}
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M15,26 A45,45 0 0 0 105,26" />
                <path d="M30,26 A30,30 0 0 0 90,26" />
                <path d="M45,26 A15,15 0 0 0 75,26" />
                <line x1="60" y1="26" x2="60" y2="71" />
            </g>

            {CUP_X.map((x, day) => {
                const level = Math.max(0, Math.min(3, levels[day] || 0));
                const state = candleState(day, litThrough, todayIndex, level, isEvening);
                const scale = 0.7 + level * 0.14;
                const isSelected = selected === day;
                const name = day === 6 ? 'שבת' : `יום ${DAY_NAMES_HE[day]}`;
                const label =
                    state === 'future' ? name :
                    state === 'ready' ? `${name}, הנר מוכן להדלקה` :
                    `${name}, ${level} מתוך 3 רגעים`;

                return (
                    <g
                        key={day}
                        role={onSelect ? 'button' : undefined}
                        tabIndex={onSelect ? 0 : undefined}
                        aria-label={label}
                        aria-pressed={onSelect ? isSelected : undefined}
                        onClick={() => !longPressed.current && onSelect?.(day)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelect?.(day);
                            }
                        }}
                        style={{ cursor: onSelect ? 'pointer' : undefined, outline: 'none' }}
                    >
                        <rect x={x - 7.5} y={0} width={15} height={CUP_Y + 8} fill="transparent" />

                        {state === 'lit' && (day === MIDDLE || level === 3) && (
                            <circle cx={x} cy={CUP_Y - 11} r={day === MIDDLE ? 12 : 9} fill={`url(#halo-${uid})`} />
                        )}

                        {state === 'lit' && (
                            <g transform={`translate(${x} ${CUP_Y - 3}) scale(${scale})`}>
                                <path
                                    className="flame"
                                    d="M0,-17 C4.5,-10 5,-4 0,0 C-5,-4 -4.5,-10 0,-17 Z"
                                    fill={`url(#flame-${uid})`}
                                    style={{ animationDelay: `${day * 0.37}s` }}
                                />
                            </g>
                        )}

                        {state === 'ready' && (
                            <line x1={x} y1={CUP_Y - 1} x2={x} y2={CUP_Y - 6} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        )}

                        {/* the cup */}
                        <path
                            d={`M${x - 5},${CUP_Y - 2} Q${x},${CUP_Y + 3} ${x + 5},${CUP_Y - 2}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            opacity={state === 'future' ? 0.45 : 1}
                        />

                        {isSelected && (
                            <circle cx={x} cy={CUP_Y - 8} r="10" fill="none" stroke="var(--accent-active)" strokeWidth="1" />
                        )}

                        {showDayNames && (
                            <text
                                x={x}
                                y={86}
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
