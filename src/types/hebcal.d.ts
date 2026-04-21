declare module 'hebcal' {
    export class HDate {
        constructor(date?: Date);
        toString(format?: string): string;
        getMonth(): number;
        getDate(): number;
        holidays(): { desc: string[] }[];

    }
    export class HebrewCalendar {
        static getHolidaysOnDate(date: HDate): any[];
    }
    export const months: any;
}
