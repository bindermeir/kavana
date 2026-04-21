"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Plus, X, ListChecks } from 'lucide-react';
import StepItem from './StepItem';
import { Task, getTasks, saveTask } from '@/lib/storage';
import { toast } from 'sonner';

interface TasksListProps {
  tasks: Task[];
}

export default function TasksList({ tasks: initialTasks }: TasksListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Partial<Task> | null>(null);
  const [newItem, setNewItem] = useState('');
  const [completedItems, setCompletedItems] = useState<number[]>([]);

  const taskTypes = [
    {
      type: 'success_list',
      title: 'רשימת הצלחות',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      description: 'רשום הצלחות מהחיים שלך - קטנות וגדולות',
      placeholder: 'למשל: סיימתי פרויקט חשוב, למדתי מיומנות חדשה...'
    },
    {
      type: 'capability_list',
      title: 'יש בי יכולת',
      icon: Zap,
      color: 'text-amber-500',
      description: 'רשום יכולות וכישורים שיש לך',
      placeholder: 'למשל: אני יודע להקשיב, אני יצירתי...'
    }
  ];

  const splitMultipleCapabilities = (items: string[]) => {
    if (!items) return [];
    const result: string[] = [];
    items.forEach(item => {
      const parts = item.split(/יש (בי|לי) יכולת/i);
      if (parts.length > 2) {
        for (let i = 1; i < parts.length; i += 2) {
          const capability = parts[i + 1];
          if (capability) {
            const cleaned = capability.replace(/^[•\-\*\s,،]+/, '').replace(/[,،]\s*$/, '').trim();
            if (cleaned.length > 0) result.push(cleaned);
          }
        }
      } else {
        const cleaned = item.trim();
        if (cleaned.length > 0) result.push(cleaned);
      }
    });
    return result;
  };

  const startNewTask = (type: string) => {
    const config = taskTypes.find(t => t.type === type);
    const existingTask = tasks?.find(t => t.task_type === type);
    const processedItems = existingTask?.items ? splitMultipleCapabilities(existingTask.items) : [];
    
    setActiveTask({
      id: existingTask?.id || crypto.randomUUID(),
      task_type: type as any,
      title: config?.title,
      items: processedItems,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const text = newItem.trim();
    let itemsToAdd: string[] = [];
    const parts = text.split(/יש (בי|לי) יכולת/i);
    
    if (parts.length > 2) {
      for (let i = 1; i < parts.length; i += 2) {
        const cap = parts[i + 1];
        if (cap) {
          const cleaned = cap.replace(/^[•\-\*\s,،]+/, '').replace(/[,،]\s*$/, '').trim();
          if (cleaned.length > 0) itemsToAdd.push(cleaned);
        }
      }
    } else {
      itemsToAdd = [text];
    }
    
    setActiveTask(prev => ({
      ...prev,
      items: [...(prev?.items || []), ...itemsToAdd]
    }));
    setNewItem('');
  };

  const removeItem = (index: number) => {
    setActiveTask(prev => ({
      ...prev,
      items: prev?.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (activeTask) {
      saveTask(activeTask as Task);
      setTasks(getTasks());
      setActiveTask(null);
      setNewItem('');
      toast.success('הרשימה נשמרה בבנק המשאבים');
    }
  };

  if (activeTask) {
    const config = taskTypes.find(t => t.type === activeTask.task_type);
    const Icon = config?.icon || ListChecks;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="sacred-card border-accent-active/20">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-accent-active/10 flex items-center justify-center ${config?.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sacred">{config?.title}</h3>
                <p className="text-sm text-text-secondary">{config?.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
                {activeTask.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <StepItem 
                      item={item}
                      index={index}
                      isCompleted={completedItems.includes(index)}
                      onToggle={(i) => setCompletedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                    />
                    <button onClick={() => removeItem(index)} className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-rose-500 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 mb-8">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={config?.placeholder}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                className="input flex-1 px-4"
              />
              <button onClick={addItem} className="btn-primary p-3">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActiveTask(null)} className="btn-ghost flex-1 py-3">ביטול</button>
              <button onClick={handleSave} disabled={!activeTask.items?.length} className="btn-primary flex-1 py-3">שמור רשימה</button>
            </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
          <h3 className="text-2xl font-bold text-sacred">מרכז אימון</h3>
          <p className="text-sm text-text-secondary italic">הרשימות האלו מזינות את המערכת ומאפשרות לה להכיר אותך עמוק יותר</p>
      </header>
      
      <div className="grid gap-4">
        {taskTypes.map((config) => {
          const Icon = config.icon;
          const existing = tasks?.find(t => t.task_type === config.type);
          
          return (
            <motion.div
              key={config.type}
              whileHover={{ scale: 1.02 }}
              onClick={() => startNewTask(config.type)}
              className="sacred-card cursor-pointer hover:border-accent-active/40"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center ${config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sacred">{config.title}</h4>
                        <p className="text-xs text-text-secondary">{config.description}</p>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-accent-active" />
                </div>
                {existing && (
                    <div className="mt-4 pt-3 border-t border-border-color/20 flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{existing.items?.length || 0} פריטים נאספו</span>
                    </div>
                )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary View */}
      <div className="pt-4 space-y-4">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">בנק המשאבים שלך</h4>
          {tasks?.map(task => {
              const config = taskTypes.find(t => t.type === task.task_type);
              if (!config) return null;
              return (
                  <div key={task.id} className="sacred-card bg-black/5 p-4 border-none shadow-none">
                      <div className="flex items-center gap-3 mb-3">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-bold text-sacred text-sm">{config.title}</span>
                      </div>
                      <div className="space-y-1 mr-7">
                          {task.items?.slice(0, 3).map((item, idx) => (
                              <p key={idx} className="text-sm text-text-primary/80">• {item}</p>
                          ))}
                          {task.items && task.items.length > 3 && (
                              <p className="text-[10px] text-text-secondary italic">ועוד {task.items.length - 3} פריטים בבנק...</p>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
}
