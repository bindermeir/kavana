"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface PrayerCardProps {
    content: string;
    onFeedback: (feedback: string) => void;
}

export default function PrayerCard({ content, onFeedback }: PrayerCardProps) {
    const [isTeachMode, setIsTeachMode] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success("הכוונה הועתקה ללוח");
    };


    const handleShare = async () => {
        const cardElement = document.getElementById('prayer-card-content');
        if (!cardElement) return;

        try {
            toast.info("מכין תמונה לשיתוף...");
            const canvas = await html2canvas(cardElement);

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                // Try Native Share
                if (navigator.share) {
                    const file = new File([blob], 'daily-kavana.png', { type: 'image/png' });
                    try {
                        await navigator.share({
                            title: 'הכוונה היומית שלי',
                            files: [file]
                        });
                        toast.success("שותף בהצלחה!");
                    } catch (e) {
                        // Fallback to download or silent fail if user cancelled
                        console.log('Share cancelled', e);
                    }
                } else {
                    // Fallback Download
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'daily-kavana.png';
                    link.href = url;
                    link.click();
                    toast.success("התמונה הורדה בהצלחה");
                }
            }, 'image/png');

        } catch (e) {
            console.error(e);
            toast.error("שגיאה ביצירת התמונה");
        }
    };

    const submitFeedback = () => {
        if (!feedback.trim()) return;
        onFeedback(feedback);
        setFeedback('');
        setIsTeachMode(false);
        toast.info("יוצר כוונה חדשה...");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-sm border border-orange-100 overflow-hidden"
        >
            <div className="p-6 space-y-4">
                <div className="prose prose-p:text-lg prose-p:leading-relaxed text-text-primary whitespace-pre-wrap font-serif">
                    {content}
                </div>
            </div>

            {/* Teaching Mode Input */}
            <AnimatePresence>
                {isTeachMode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-orange-50/50 px-4"
                    >
                        <div className="py-3 flex gap-2 items-center">
                            <input
                                type="text"
                                autoFocus
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="לדוגמה: יותר קצר, יותר פואטי..."
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                onKeyDown={e => e.key === 'Enter' && submitFeedback()}
                            />
                            <button
                                onClick={submitFeedback}
                                className="p-2 bg-primary text-white rounded-lg shadow-sm active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsTeachMode(false)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions Footer */}
            <div className="flex gap-1 p-2 bg-gray-50/50 border-t border-gray-100">
                <ActionBtn icon={Copy} label="העתק" onClick={handleCopy} />
                <ActionBtn icon={Share2} label="שתף" onClick={handleShare} />
                <ActionBtn
                    icon={MessageCircle}
                    label="דייק אותי"
                    onClick={() => setIsTeachMode(!isTeachMode)}
                    active={isTeachMode}
                />
            </div>
        </motion.div>
    );
}

function ActionBtn({ icon: Icon, label, onClick, active }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${active ? 'bg-orange-100 text-primary' : 'hover:bg-gray-100 text-text-secondary'}`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );
}
