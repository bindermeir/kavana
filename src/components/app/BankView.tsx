'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Star, Zap, X } from 'lucide-react';
import { toast } from 'sonner';
import { addTask, deleteTask, getTasks } from '@/lib/storage';
import type { Task, TaskType } from '@/lib/types';
import { useKavana } from './KavanaContext';

const LISTS: { type: TaskType; title: string; subtitle: string; icon: React.ElementType; placeholder: string }[] = [
    { type: 'capability_list', title: 'יש בי', subtitle: 'היכולות שהפעלת. הן הראיות לכוח שבך.', icon: Zap, placeholder: 'יש בי...' },
    { type: 'success_list', title: 'הצלחתי', subtitle: 'קטנות וגדולות. כל אחת היא אבן בבית.', icon: Star, placeholder: 'הצלחתי ל...' },
];

/** The bank: every asif adds evidence here, and every morning kavana draws from it. */
export default function BankView() {
    const { today, records } = useKavana();
    const [tasks, setTasks] = useState<Task[] | null>(null);
    const [adding, setAdding] = useState<TaskType | null>(null);
    const [text, setText] = useState('');

    useEffect(() => {
        getTasks().then(setTasks);
    }, [records]);

    const add = async (type: TaskType) => {
        if (!text.trim()) return;
        try {
            const t = await addTask(type, text.trim(), today);
            setTasks((prev) => [t, ...(prev || [])]);
            setText('');
            setAdding(null);
        } catch {
            toast.error('לא הצלחנו לשמור');
        }
    };

    const remove = async (id: string) => {
        setTasks((prev) => (prev || []).filter((t) => t.id !== id));
        await deleteTask(id);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold">יש בי</h1>
                <p className="text-text-secondary leading-relaxed">בנק הראיות שלך. ממנו נכתבת כל כוונת בוקר.</p>
            </div>

            {!tasks ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-text-muted" />
            ) : (
                LISTS.map(({ type, title, subtitle, icon: Icon, placeholder }) => {
                    const items = tasks.filter((t) => t.task_type === type);
                    return (
                        <section key={type} className="sacred-card space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Icon className="w-5 h-5 text-flame" />
                                        {title}
                                    </h2>
                                    <p className="text-sm text-text-secondary">{subtitle}</p>
                                </div>
                                <span className="text-sm text-text-muted shrink-0">{items.length}</span>
                            </div>

                            {items.length === 0 ? (
                                <p className="text-sm text-text-muted">יתמלא מעצמו מהאסיף של הערב.</p>
                            ) : (
                                <ul className="divide-y divide-accent-border/15">
                                    {items.map((t) => (
                                        <li key={t.id} className="py-2.5 flex items-center justify-between gap-3 group">
                                            <span className="leading-relaxed">{t.content}</span>
                                            <button
                                                onClick={() => remove(t.id)}
                                                className="opacity-40 group-hover:opacity-100 focus:opacity-100 p-1 text-text-muted hover:text-text-primary"
                                                aria-label={`מחיקת "${t.content}"`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {adding === type ? (
                                <div className="flex gap-2">
                                    <input
                                        className="input flex-1"
                                        autoFocus
                                        placeholder={placeholder}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && add(type)}
                                        maxLength={300}
                                    />
                                    <button className="btn-primary !px-4 !py-2" onClick={() => add(type)} disabled={!text.trim()}>
                                        הוספה
                                    </button>
                                </div>
                            ) : (
                                <button className="btn-quiet !px-0 text-sm flex items-center gap-1.5" onClick={() => { setAdding(type); setText(''); }}>
                                    <Plus className="w-4 h-4" />
                                    הוספה ידנית
                                </button>
                            )}
                        </section>
                    );
                })
            )}
        </div>
    );
}
