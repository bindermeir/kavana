import { HDate } from 'hebcal';
import { getZadokDate } from '../calendar/zadokCalendar';
import { dayIndex, parseLocalDate } from '../dates';

export interface DailyContext {
    dayIndex: number;
    hebrewDate: string;
    dayQuality: { name: string; description: string };
    season: { name: string; metaphor: string };
    holiday?: string;
    zadok?: { text: string; festival?: string };
}

// The quality of each day in the menorah week. Day four is the lights' day.
const DAY_QUALITIES = [
    { name: 'בריאה', description: 'התחלה חדשה, הנר הראשון של השבוע, יש מאין.' },
    { name: 'הבדלה', description: 'התמודדות עם ניגודים, להבחין בין עיקר לטפל.' },
    { name: 'זרימה', description: 'איזון, הרמוניה, חיבור.' },
    { name: 'המאורות', description: 'הנר האמצעי: ביום הרביעי נבראו המאורות. אור, פרספקטיבה, אמצע הדרך.' },
    { name: 'סיבולת', description: 'עומק, סבלנות, הודיה על הקיים.' },
    { name: 'הכנה', description: 'לקראת השבת: סיכום, התכנסות, השלמה.' },
    { name: 'שלמות', description: 'המנורה שלמה: מנוחה, נוכחות, כל האור של השבוע.' },
];

const SEASONS = {
    winter: { name: 'חורף', metaphor: 'התכנסות פנימה, העמקת שורשים, אגירת כוחות.' },
    spring: { name: 'אביב', metaphor: 'פריחה, התחדשות, יציאה מעבדות לחירות.' },
    summer: { name: 'קיץ', metaphor: 'עוצמה, ביטוי חיצוני, פירות העמל.' },
    autumn: { name: 'סתיו', metaphor: 'חשבון נפש, שילוח, רוחות של שינוי.' },
};

export function getDailyContext(dateStr: string, opts: { zadok?: boolean } = {}): DailyContext {
    const date = parseLocalDate(dateStr);
    const hdate = new HDate(date);
    const idx = dayIndex(dateStr);

    // Hebrew months: Nisan = 1 ... Tishrei = 7
    const month = hdate.getMonth();
    const season =
        month >= 1 && month <= 3 ? SEASONS.spring :
        month >= 4 && month <= 6 ? SEASONS.summer :
        month >= 7 && month <= 9 ? SEASONS.autumn :
        SEASONS.winter;

    let holiday: string | undefined;
    try {
        const list = hdate.holidays();
        if (list && list.length > 0) holiday = list[0].desc?.[2] || list[0].desc?.[0];
    } catch {
        // hebcal holiday data is a nice-to-have
    }

    const ctx: DailyContext = {
        dayIndex: idx,
        hebrewDate: hdate.toString('h'),
        dayQuality: DAY_QUALITIES[idx],
        season,
        holiday,
    };

    if (opts.zadok) {
        const z = getZadokDate(date);
        ctx.zadok = { text: z.displayText, festival: z.festival };
    }
    return ctx;
}
