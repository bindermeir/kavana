"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailyCalendarInfo, DailyCalendarInfo } from '@/lib/calendar/CultureEngine';
import { getProfile } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DateDisplay() {
  const [calInfo, setCalInfo] = useState<DailyCalendarInfo | null>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    async function loadInfo() {
      const profile = await getProfile();
      const info = getDailyCalendarInfo(profile, new Date());
      setCalInfo(info);
    }
    loadInfo();
  }, []);

  if (!calInfo) return <div className="py-4 text-center text-text-secondary opacity-50">...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-2 py-4"
    >
      {/* Gregorian Date */}
      <p className="text-functional text-xs font-bold uppercase tracking-widest text-text-secondary">
        {calInfo.gregorian.dayName} • {calInfo.gregorian.dateStr}
      </p>
      
      {/* Hebrew Calendar Date (If Subscribed/Default) */}
      {calInfo.hebrew && (
        <p className="text-sacred text-2xl font-bold text-text-primary">
          {calInfo.hebrew.dateStr}
        </p>
      )}
      
      {/* Zadok Priestly Calendar (If Subscribed/Default) */}
      {calInfo.zadok && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-3 border-t border-accent-border/30 mt-2"
        >
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">
            {t.calendar.zadok}
          </p>
          <p className="text-sm font-medium text-accent-active">
            {calInfo.zadok.dateStr}
          </p>
          {calInfo.zadok.events.map((event, idx) => (
            <motion.p 
              key={idx}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-xs mt-2 font-bold bg-accent-active/10 text-accent-active inline-block px-3 py-1 rounded-full mx-1"
            >
              ⚡ {event.name}
            </motion.p>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
