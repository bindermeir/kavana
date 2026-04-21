import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Compass, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen min-h-[100dvh] relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <header className="relative z-10 px-4 pt-6 pb-4 flex items-center">
                <Link href="/dashboard" className="p-2 rounded-xl hover:bg-surface-bg transition-colors">
                    <ArrowRight className="w-6 h-6" />
                </Link>
                <h1 className="text-xl font-bold ml-4 mr-2">אודות Kavana</h1>
            </header>

            <main className="relative z-10 px-6 py-4 space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Kavana AI</h1>
                    <p className="text-lg text-text-secondary font-medium">כוונה אישית במציאות עמוסה</p>
                </div>

                <div className="space-y-6 text-base leading-relaxed text-text-secondary">
                    <div className="card p-6 border-primary/20 bg-primary/5">
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5" /> המטרה שלנו
                        </h2>
                        <p>
                            להוות "מאמן אישי מנטלי" שמלווה אותך ביומיום באמצעות כוונה קצרה, מדויקת ועמוקה. 
                            האפליקציה משתמשת בסגנון של תפילה ומדיטציה, המותאם אישית אליך, לאמונות שלך ולשפה שלך – בין אם אתה דתי, חילוני או רוחני.
                        </p>
                    </div>

                    <div className="card p-6 border-purple-500/20 bg-purple-500/5">
                        <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2 mb-3">
                            <Compass className="w-5 h-5" /> הנדסה לאחור של החיים
                        </h2>
                        <p>
                            אנחנו רואים את החיים כמו תוכנית עסקית ארוכת טווח. יש לך <strong>כוכב צפון</strong> (איפה תרצה להיות בעוד 5 שנים), ויש את <strong>המטרה התקופתית</strong>. 
                            אבל ביומיום יש חיכוך, לחץ ורעש. 
                        </p>
                        <p className="mt-2">
                            Kavana לוקחת את החזון הגדול שלך, מפרקת אותו, ומחברת אותו לאתגר המיידי שיש לך <strong>היום בבוקר</strong>. הכוונה היומית משקפת את המטרה הגדולה שלך דרך הפריזמה של ההתמודדות היומית.
                        </p>
                    </div>

                    <div className="card p-6 border-amber-500/20 bg-amber-500/5">
                        <h2 className="text-lg font-bold text-amber-500 dark:text-amber-400 flex items-center gap-2 mb-3">
                            <Heart className="w-5 h-5" /> למי זה נועד?
                        </h2>
                        <p>
                            האפליקציה נבנתה עבור מי שהיה רוצה את היתרונות הפסיכולוגיים והרוחניים של תפילה, מדיטציה או יומן תודה – אבל מציאות החיים העמוסה שלו לא מאפשרת לו לפנות שעה ביום לשבת ולמדוט.
                        </p>
                        <p className="mt-2">
                            בפחות מדקה, המערכת מזהה את מה שמטריד אותך, שולפת ממשאבי העבר וההצלחות שלך, ויוצרת רגע של סדר, רוגע, והתקדמות לקראת היעד הגדול.
                        </p>
                    </div>
                </div>

                <div className="text-center pt-8 pb-12 text-sm text-text-muted">
                    <p>נבנה באהבה. המערכת לומדת איתך וגדלה איתך.</p>
                </div>
            </main>
        </div>
    );
}
