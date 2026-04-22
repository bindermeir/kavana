"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment-timezone';
import { getZadokDate, ZadokDate } from '@/lib/calendar/zadokCalendar';
const { HDate } = require('hebcal');

export default function DateDisplay({ timezone = 'Asia/Jerusalem' }) {
  const [zadokInfo, setZadokInfo] = useState<ZadokDate | null>(null);
  const [hebrewDateStr, setHebrewDateStr] = useState('');
  
  useEffect(() => {
    const now = new Date();
    setZadokInfo(getZadokDate(now));
    
    // Hebcal for Hebrew Date
    const hDate = new HDate(now);
    setHebrewDateStr(hDate.toString('h')); // Hebrew characters
  }, []);

  const today = moment.tz(timezone);
  const dayName = today.locale('he').format('dddd');
  const gregorianDate = today.format('DD.MM.YYYY');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-2 py-4"
    >
      {/* Gregorian Date */}
      <p className="text-functional text-xs font-bold uppercase tracking-widest text-text-secondary">
        {dayName} • {gregorianDate}
      </p>
      
      {/* Hebrew Calendar Date */}
      <p className="text-sacred text-2xl font-bold text-text-primary">
        {hebrewDateStr}
      </p>
      
      {/* Zadok Priestly Calendar */}
      {zadokInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-3 border-t border-accent-border/30 mt-2"
        >
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">
            לוח בני צדוק הכהני
          </p>
          <p className="text-sm font-medium text-accent-active">
            {zadokInfo.displayText}
          </p>
          {zadokInfo.festival && (
            <motion.p 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-xs mt-2 font-bold bg-accent-active/10 text-accent-active inline-block px-3 py-1 rounded-full"
            >
              ⚡ {zadokInfo.festival}
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
