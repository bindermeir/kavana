import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Menorah from '@/components/menorah/Menorah';

export const metadata = { title: 'על כוונה' };

export default function AboutPage() {
    return (
        <main className="min-h-dvh max-w-xl mx-auto px-6 py-8 space-y-10">
            <header className="flex items-center gap-2">
                <Link href="/dashboard" className="btn-quiet !p-2" aria-label="חזרה">
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">על כוונה</h1>
            </header>

            <div className="flex flex-col items-center gap-4 text-center">
                <Menorah litThrough={6} levels={[3, 3, 3, 3, 3, 3, 3]} className="w-40" />
                <p className="text-2xl font-serif">התכווננות יומית, במינימום זמן</p>
            </div>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">למה</h2>
                <p>
                    תפילה, מדיטציה ויומן תודה עושים טוב לנפש. אבל רוב האנשים לא יכולים לפנות שעה ביום לשבת ולמדוט.
                    כוונה עושה עבודה דומה בכמה דקות ביום, מותאמת אליך: לאמונה שלך, לשפה שלך ולחיים שלך.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">שלושה רגעים ביום</h2>
                <p><strong>שחרית:</strong> דקה שמכוונת את היום. רואים את היום שמגיע, את המכשול הצפוי, ואת התגובה שמתאימה למי שאנחנו רוצים להיות.</p>
                <p><strong>מנחה:</strong> עצירה באמצע הרעש. נשימה, שם לרגש, וחזרה לכוונה של הבוקר.</p>
                <p><strong>ערבית:</strong> אסיף. מה הצלחתי, מה יש בי, על מה תודה. מזה נכתבת &quot;הצהרת היש&quot;: מה שכבר קיים, בזמן הווה.</p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">שבעה נרות בשבוע</h2>
                <p>
                    השבוע הוא היחידה היחידה של זמן שלא נקבעת בשמיים: הוא ספירה בידי אדם. לכן המנורה כאן היא השבוע שלך.
                    בכל יום נדלק נר, וכל רגע של התכווננות מגביר את הלהבה. בשבת המנורה שלמה, ונכתבת המגילה השבועית.
                </p>
                <p className="text-sm text-text-secondary">לחיצה ארוכה על המנורה תגלה עוד.</p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">השורשים</h2>
                <p>
                    כוונה נולדה מהפילוסופיה הסטואית: ההכנה לבוקר של מרקוס אורליוס, ההבחנה של אפיקטטוס בין מה שבידינו למה שלא,
                    וסקירת הערב של סנקה. ממנה צמח גם הטיפול הקוגניטיבי (CBT), שעליו נשען האסיף. ביהדות, פרקי אבות הם המקבילה הקרובה ביותר.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed text-sm text-text-secondary border-t border-accent-border/30 pt-6">
                <p>
                    כוונה היא כלי להתכווננות, לא תחליף לטיפול. אם קשה לך מאוד, אפשר לדבר עכשיו עם ער&quot;ן בטלפון 1201, בכל שעה.
                </p>
                <p>מה שכותבים בכוונה שייך רק לך. הוא נשמר בחשבון שלך, ונשלח למודל ה-AI (Google Gemini, ובזמן תקלה שם Anthropic Claude) רק כדי לכתוב את הכוונות שלך.</p>
            </section>
        </main>
    );
}
