'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Heart, Sun, Moon } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getProfile();
    if (profile) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/10 blur-3xl"
        />

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 right-8 text-primary/20"
        >
          <Sun className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/3 left-8 text-accent/20"
        >
          <Moon className="w-12 h-12" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10">
        {/* Logo / Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
            <span className="text-5xl">🕯️</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-3 gradient-text">
            כוונה
          </h1>
          <p className="text-xl text-text-secondary">
            תפילה אישית
          </p>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card-elevated p-6 max-w-sm text-center mb-10"
        >
          <p className="text-lg leading-relaxed text-text-primary">
            התחברו ללב, למילים ולכוונה שלכם.
            <br />
            <span className="text-text-secondary">
              צרו תפילה המותאמת בדיוק עבורכם, בכל רגע ובכל מצב.
            </span>
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <Link
            href="/onboarding"
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg rounded-2xl"
          >
            <Sparkles className="w-5 h-5" />
            התחילו את המסע
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-6 mt-10"
        >
          {[
            { icon: '🌅', label: 'תפילת בוקר' },
            { icon: '🌙', label: 'כוונת ערב' },
            { icon: '✨', label: 'AI אישי' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <span className="text-xs text-text-muted font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-6 text-text-muted text-sm flex items-center justify-center gap-2"
      >
        <span>נבנה באהבה</span>
        <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
      </motion.footer>
    </main>
  );
}
