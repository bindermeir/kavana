import { HDate, HebrewCalendar, months } from 'hebcal';

export interface DailyContext {
    hebrewDateString: string;
    weeklyEnergy: {
        name: string;
        description: string;
    };
    season: {
        name: string;
        metaphor: string;
    };
    isRoshChodesh: boolean;
    isHoliday: boolean;
    holidayName?: string;
}

const WEEKLY_ENERGIES = [
    { name: "בריאה", description: "התחלה חדשה, פוטנציאל, יש מאין." }, // Sunday (0)
    { name: "מורכבות", description: "התמודדות עם ניגודים, הבדלה." },   // Monday (1)
    { name: "זרימה", description: "איזון, הרמוניה, חיבור." },           // Tuesday (2)
    { name: "גובה", description: "פרספקטיבה, התעלות, נצח." },           // Wednesday (3)
    { name: "סיבולת", description: "הודיה על הקיים, סבלנות, עומק." },   // Thursday (4)
    { name: "הכנה", description: "לקראת שבת, סיכום, התכנסות." },        // Friday (5)
    { name: "הוויה", description: "מנוחה, שלמות, נוכחות." },            // Saturday (6)
];

const SEASONS = {
    WINTER: { name: "חורף", metaphor: "התכנסות פנימה, העמקת שורשים, אגירת כוחות." },
    SPRING: { name: "אביב", metaphor: "פריחה, התחדשות, יציאה מעבדות לחירות." },
    SUMMER: { name: "קיץ", metaphor: "עוצמה, ביטוי חיצוני, פירות העמל." },
    AUTUMN: { name: "סתיו", metaphor: "שילוח, חשבון נפש, רוחות של שינוי." }
};

export function getDailyContext(): DailyContext {
    const now = new Date();
    const hdate = new HDate(now);

    // 1. Hebrew Date String
    const hebrewDateString = hdate.toString('h');

    // 2. Weekly Energy
    const dayOfWeek = now.getDay();
    const weeklyEnergy = WEEKLY_ENERGIES[dayOfWeek];

    // 3. Season (Based on Hebrew Month approx)
    const month = hdate.getMonth(); // Nisan = 1, Tishrei = 7
    let season = SEASONS.WINTER;
    if (month >= 1 && month <= 3) season = SEASONS.SPRING;      // Nisan, Iyar, Sivan
    else if (month >= 4 && month <= 6) season = SEASONS.SUMMER; // Tamuz, Av, Elul
    else if (month >= 7 && month <= 9) season = SEASONS.AUTUMN; // Tishrei, Cheshvan, Kislev
    else season = SEASONS.WINTER; // Tevet, Shvat, Adar

    // 4. Holidays & Rosh Chodesh
    // Simplified holiday check using hdate.holidays() method
    const holidays = hdate.holidays();
    const isHoliday = holidays && holidays.length > 0;
    // desc is array: [english, ?, hebrew]
    const holidayName = isHoliday ? holidays[0].desc[2] : undefined;
    const isRoshChodesh = hdate.getDate() === 1 || hdate.getDate() === 30;

    return {
        hebrewDateString,
        weeklyEnergy,
        season,
        isRoshChodesh,
        isHoliday,
        holidayName
    };
}
