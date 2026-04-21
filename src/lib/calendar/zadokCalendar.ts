/**
 * zadokCalendar.ts - Logic for the Zadok Priestly (Qumran) 364-day Solar Calendar.
 */

export interface ZadokDate {
    day: number;
    month: number;
    monthName: string;
    dayOfWeek: string;
    displayText: string;
    festival?: string;
    priestlyCourse?: string; // Information about which priestly family is serving
}

const MONTH_NAMES = [
    "החודש הראשון", "החודש השני", "החודש השלישי",
    "החודש הרביעי", "החודש החמישי", "החודש השישי",
    "החודש השביעי", "החודש השמיני", "החודש התשיעי",
    "החודש העשירי", "החודש האחד עשר", "החודש השנים עשר"
];

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// Major Festivals in the Zadok Calendar
const FESTIVALS: Record<string, string> = {
    "1-1": "ראש השנה הכהני",
    "1-14": "פסח (ערב)",
    "1-15": "חג המצות",
    "1-26": "הנפת העומר (לפי הלוח הכהני)",
    "3-15": "חג השבועות (חג הביכורים)",
    "5-3": "חג התירוש",
    "6-22": "חג היצהר",
    "7-1": "יום הזיכרון (תרועה)",
    "7-10": "יום הכיפורים",
    "7-15": "חג הסוכות",
    "9-15": "חג השמן/חנוכה (לפי חלק מהפרשנויות)",
};

/**
 * Calculates the Zadok date based on a reference start point.
 * We use the Spring Equinox 2024 (Wednesday, March 20) as 1/1/1.
 */
export function getZadokDate(date: Date): ZadokDate {
    // Reference: March 20, 2024 was 1st of 1st month (Wednesday)
    const reference = new Date(2024, 2, 20); 
    
    // Calculate total days since reference
    const diffTime = date.getTime() - reference.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate position in the 364-day cycle
    const dayOfYear = ((diffDays % 364) + 364) % 364; 
    
    // Determine Month and Day
    // Structure: 4 Quarters of 91 days. 
    // Each Quarter: 30, 30, 31 days.
    let month = 0;
    let day = 0;
    let remainingDays = dayOfYear;
    
    for (let q = 0; q < 4; q++) {
        if (remainingDays < 30) { month = q * 3 + 1; day = remainingDays + 1; break; }
        remainingDays -= 30;
        if (remainingDays < 30) { month = q * 3 + 2; day = remainingDays + 1; break; }
        remainingDays -= 30;
        if (remainingDays < 31) { month = q * 3 + 3; day = remainingDays + 1; break; }
        remainingDays -= 31;
    }

    // Day of week (Always matches the day index because it's a fixed 364-day calendar starting on Wed)
    // Day 0 of year is always Wednesday (index 3)
    const dayOfWeekIndex = (dayOfYear + 3) % 7;
    const dayOfWeek = DAYS_OF_WEEK[dayOfWeekIndex];
    
    const festKey = `${month}-${day}`;
    const festival = FESTIVALS[festKey];

    return {
        day,
        month,
        monthName: MONTH_NAMES[month - 1],
        dayOfWeek,
        festival,
        displayText: `יום ${dayOfWeek}, ${day} ב${MONTH_NAMES[month - 1]}`,
    };
}
