"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface DailyQuoteCardProps {
  quote: string;
  profileName?: string;
}

export default function DailyQuoteCard({ quote, profileName }: DailyQuoteCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="sacred-card p-10 text-center space-y-8 relative overflow-hidden"
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-accent-border/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-accent-border/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-accent-border/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-accent-border/30 rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10 space-y-6">
        <div className="w-12 h-1 bg-accent-border/20 mx-auto" />
        
        <p className="text-3xl font-bold text-sacred leading-relaxed text-text-primary">
          {quote}
        </p>

        <div className="w-12 h-1 bg-accent-border/20 mx-auto" />
        
        <div className="pt-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">
            Kavana AI Intention
          </p>
        </div>
      </div>
    </motion.div>
  );
}
