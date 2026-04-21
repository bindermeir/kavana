"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Heart } from 'lucide-react';
import { saveOffload, getProfile } from '@/lib/storage';
import { toast } from 'sonner';

export default function OffloadModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [stage, setStage] = useState<'input' | 'loading' | 'response'>('input');

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setStage('loading');
        
        try {
            // Save offload to storage
            const offload = {
                id: crypto.randomUUID(),
                user_id: getProfile()?.id || 'guest',
                content: content,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };
            saveOffload(offload);

            // AI Generation (Simulated for now, or you can call /api/generate-offload)
            // We'll simulate a 2-second "listening" period
            setTimeout(() => {
                setResponse("הקשבתי לכל מילה. תודה ששיחררת את זה. הכל בסדר, תנשום עמוק. הדיו ספג את הכל והפך את זה לכוונה שקטה.");
                setStage('response');
            }, 2000);

        } catch (e) {
            toast.error('אירעה שגיאה בעיבוד הפריקה');
            setStage('input');
        }
    };

    const handleClose = () => {
        setContent('');
        setResponse(null);
        setStage('input');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg sacred-card p-6 overflow-hidden max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 left-4 p-2 rounded-full transition-colors text-text-secondary hover:text-primary"
                >
                    <X className="w-5 h-5" />
                </button>

                {stage === 'input' && (
                    <div className="space-y-6 pt-2">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-sacred mb-1">פריקה</h3>
                            <p className="text-text-secondary">שתף מה שעל ליבך כעת</p>
                        </div>

                        <textarea
                            autoFocus
                            className="input w-full min-h-[200px] resize-none text-lg leading-relaxed bg-black/5 p-4 rounded-xl border-none ring-0 focus:ring-1 focus:ring-accent/20 transition-all"
                            placeholder="מה קורה איתך כרגע? מה מציק? מה עולה?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim()}
                            className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                        >
                            קבל בהירות וכוונה
                        </button>
                    </div>
                )}

                {stage === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <p className="text-lg font-medium text-text-secondary animate-pulse">
                            מקשיב ומגבש...
                        </p>
                    </div>
                )}

                {stage === 'response' && response && (
                    <div className="space-y-8 pt-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-4">
                                <Heart className="w-8 h-8 flame-breathe fill-accent/20" />
                            </div>
                            <h3 className="text-2xl font-bold text-sacred">בהירות לרגע הזה</h3>
                        </div>

                        <div className="prose prose-stone max-w-none">
                            <p className="text-xl leading-relaxed text-sacred font-light italic text-center whitespace-pre-wrap px-2">
                                {response}
                            </p>
                        </div>

                        <button
                            onClick={handleClose}
                            className="btn-primary w-full py-5 text-xl"
                        >
                            סגור
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
