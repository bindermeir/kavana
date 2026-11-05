import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'מדיניות פרטיות' };

const CONTACT_EMAIL = 'bindermeir@gmail.com';

export default function PrivacyPage() {
    return (
        <main className="min-h-dvh max-w-xl mx-auto px-6 py-8 space-y-10">
            <header className="flex items-center gap-2">
                <Link href="/" className="btn-quiet !p-2" aria-label="חזרה">
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">מדיניות פרטיות</h1>
            </header>

            <p className="text-sm text-text-secondary">עודכן לאחרונה: 5 בנובמבר 2026</p>

            <section className="space-y-3 leading-relaxed">
                <p>
                    בכוונה כותבים דברים אישיים. לכן חשוב שיהיה ברור מה נשמר, לאן זה נשלח ומה אפשר לעשות עם זה.
                    בכל שאלה אפשר לכתוב אל <a className="underline" href={`mailto:${CONTACT_EMAIL}`} dir="ltr">{CONTACT_EMAIL}</a>.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">מה נשמר</h2>
                <ul className="list-disc pr-5 space-y-2">
                    <li><strong>חשבון:</strong> כתובת מייל. בכניסה עם Google נשמרים גם השם ופרטי הפרופיל הבסיסיים שמגיעים מ-Google.</li>
                    <li><strong>פרופיל:</strong> מה שמוסרים כדי להתאים את כוונה, למשל שם, מגדר, אמונה ותרבות, ערכים, מטרות, עבודה וכסף, זוגיות וגבולות תוכן. חלק מהפרטים האלה רגישים, ואפשר לדלג על מה שלא חובה.</li>
                    <li><strong>מה שכותבים:</strong> הכוונות, הרגשות במנחה, האסיף, פריקות והתשובות להן.</li>
                    <li><strong>מה שכוונה למדה:</strong> דיוקן קצר שה-AI כותב ומעדכן, הצהרות היש, משפטי היום והמגילות השבועיות.</li>
                    <li><strong>משוב ובקשות:</strong> דירוג של טקסט שנכתב, והטקסט עצמו. אם מבקשים אמונה או תרבות שעוד אין, הבקשה נשמרת יחד עם מזהה המשתמש.</li>
                    <li><strong>אירועי שימוש:</strong> פעולות כמו סיום אסיף או שיתוף, בלי מזהה משתמש ובלי מה שנכתב. בהרשמה נרשמים כך גם האמונה שנבחרה והשפה. בפריקה נרשם גם אם זוהתה מצוקה.</li>
                    <li><strong>בדפדפן:</strong> פרטי ההתחברות והעדפת התצוגה. אין בכוונה פרסומות, ואין כלי מעקב של צד שלישי.</li>
                </ul>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">לאן זה נשלח</h2>
                <p>
                    כדי לכתוב עבורך, כוונה שולחת למודל AI את מה שכתבת ברגע הזה, יחד עם פרטי הפרופיל, הדיוקן וקטעים מההיסטוריה שלך.
                    זה נעשה בכל כתיבה של כוונה, הצהרת יש, תשובה לפריקה או מגילה.
                </p>
                <p>
                    <strong>Google Gemini</strong> הוא המודל הראשי. כוונה משתמשת כרגע בשירות ללא תשלום. לפי תנאי Google, בשירות כזה Google רשאית להשתמש בתוכן ובתשובות לשיפור המוצרים שלה, ובודקים אנושיים עשויים לקרוא אותם אחרי ניתוק מהחשבון של כוונה.
                    Google ממליצה לא לשלוח בשירות הזה מידע רגיש או אישי. כדאי לקחת זאת בחשבון לפני שכותבים פרטים מזהים או רגישים.
                </p>
                <p>
                    <strong>Anthropic Claude</strong> משמש גיבוי כש-Gemini לא זמין. לפי תנאי Anthropic, תוכן שנשלח דרך ה-API לא משמש כברירת מחדל לאימון המודלים שלה.
                </p>
                <p>
                    שירותים נוספים: <strong>Supabase</strong> מאחסן את החשבונות והנתונים, <strong>Vercel</strong> מריץ את האתר, ו-<strong>Google</strong> מטפל בכניסה עם Google למי שבוחר בה.
                    ספקים אלה עשויים לעבד מידע מחוץ לישראל, לפי התנאים שלהם.
                </p>
                <p>המידע לא נמכר, ולא משמש לפרסום.</p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">מי יכול לראות</h2>
                <p>
                    משתמשים אחרים לא יכולים לראות את מה שכתבת. למפעיל כוונה יש גישה טכנית למסד הנתונים, ולכן הנתונים לא מוצפנים מפניו.
                    הגישה מיועדת לתפעול, לתיקון תקלות ולטיפול בבקשות.
                </p>
                <p>
                    מערכת החשבונות של כוונה משותפת לאפליקציה נוספת של אותו מפעיל, Famflow. הנתונים של כוונה נשמרים בנפרד, ובכוונה כל משתמש ניגש רק לנתונים שלו.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">שיתוף</h2>
                <p>
                    משפט היום יוצא רק כשבוחרים לשתף אותו, ורואים אותו לפני כן. המשפט נכתב בלי פרטים אישיים, אבל הוא נכתב בידי AI, אז כדאי לקרוא אותו לפני השיתוף.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">עיון, עריכה ומחיקה</h2>
                <p>
                    בעמוד הפרופיל אפשר לראות ולערוך את הפרטים ואת הדיוקן, ולמחוק את מה שכוונה למדה עליך.
                    המידע נשמר כל עוד החשבון פעיל. עדיין אין באפליקציה כפתור למחיקת חשבון, ולכן למחיקת הנתונים או החשבון יש לכתוב אל הכתובת שלמעלה.
                </p>
                <p>
                    מידע שכבר נשלח לספקי ה-AI כפוף לתנאים שלהם, וייתכן שלא נוכל למחוק אותו מהמערכות שלהם.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">במצוקה</h2>
                <p>
                    אם ה-AI מזהה מצוקה בפריקה, מוצגת הפניה לעזרה. אף אדם לא מקבל על כך הודעה, וכוונה לא עוקבת אחרי זה ולא פונה לגורם כלשהו.
                    כוונה היא לא שירות חירום ולא תחליף לטיפול. אפשר לדבר עם ער&quot;ן בטלפון 1201, בכל שעה. בסכנה מיידית: 101.
                </p>
            </section>

            <section className="space-y-3 leading-relaxed">
                <h2 className="text-2xl font-bold">שינויים במדיניות</h2>
                <p>אם המדיניות תשתנה, הנוסח המעודכן יופיע כאן עם תאריך חדש.</p>
            </section>
        </main>
    );
}
