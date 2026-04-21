"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface StepItemProps {
    item: string;
    index: number;
    isCompleted: boolean;
    onToggle: (index: number) => void;
}

export default function StepItem({ item, index, isCompleted, onToggle }: StepItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
      className="flex items-center gap-4 p-3 rounded-lg group"
    >
      <div
        onClick={() => onToggle(index)}
        className={`step-circle cursor-pointer ${isCompleted ? 'lit' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(index)}
        aria-label={isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
      />
      <span 
        className="flex-1 text-functional"
        style={{ 
          color: isCompleted ? 'var(--accent-active)' : 'var(--text-primary)',
          textDecoration: isCompleted ? 'line-through' : 'none',
          opacity: isCompleted ? 0.6 : 1,
          transition: 'all 0.6s ease-out'
        }}
      >
        {item}
      </span>
    </motion.div>
  );
}
