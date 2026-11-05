import type { UserProfile } from './types';

/**
 * Getting to know the user. Day one asks only what the first kavana needs.
 * The rest arrives one question a day through the first week, so every
 * answer improves tomorrow's kavana and sensitive topics come after trust.
 */
export type QuestionKey =
    | 'basics' | 'belief' | 'focus'
    | 'vision' | 'values' | 'state' | 'strengths' | 'work' | 'relationship' | 'voice' | 'tradition' | 'rhythm';

export interface Question {
    key: QuestionKey;
    title: string;
    subtitle: string;
    /** Can this be answered? Used to enable the "continue" button. */
    isAnswered: (p: Partial<UserProfile>) => boolean;
}

export const DAY_ONE: Question[] = [
    {
        key: 'basics',
        title: 'נעים להכיר',
        subtitle: 'איך לקרוא לך, ובאיזו שפה לכתוב לך',
        isAnswered: (p) => !!p.name?.trim() && !!p.gender,
    },
    {
        key: 'belief',
        title: 'השפה של המשמעות',
        subtitle: 'כדי שהכוונה תדבר בשפה שלך',
        isAnswered: (p) => !!p.belief_system,
    },
    {
        key: 'focus',
        title: 'מה הכי מעסיק אותך עכשיו?',
        subtitle: 'מטרה, אתגר, או משהו שיושב על הלב',
        isAnswered: (p) => !!p.current_goal?.trim(),
    },
];

export const WEEK_ONE: Question[] = [
    {
        key: 'vision',
        title: 'כוכב הצפון',
        subtitle: 'איפה היית רוצה להיות בעוד חמש שנים?',
        isAnswered: (p) => !!p.future_vision?.trim(),
    },
    {
        key: 'values',
        title: 'מה באמת חשוב לך?',
        subtitle: 'הערכים שהכוונה תישען עליהם',
        isAnswered: (p) => (p.core_values?.length || 0) > 0,
    },
    {
        key: 'state',
        title: 'איפה הנפש עכשיו?',
        subtitle: 'כדי לדעת איך לדבר איתך בתקופה הזו',
        isAnswered: (p) => !!p.current_state,
    },
    {
        key: 'strengths',
        title: 'יש בי',
        subtitle: 'החוזקות שכבר ידועות לך על עצמך',
        isAnswered: (p) => (p.personal_abilities?.length || 0) > 0 || !!p.abilities_note?.trim(),
    },
    {
        key: 'work',
        title: 'עבודה, כסף ושפע',
        subtitle: 'איפה זה עומד היום',
        isAnswered: (p) => !!p.work_money_place,
    },
    {
        key: 'relationship',
        title: 'זוגיות',
        subtitle: 'כדי שהכוונה לא תכתוב דבר שלא מתאים לך',
        isAnswered: (p) => !!p.relationship_status,
    },
    {
        key: 'voice',
        title: 'הקול של הכוונה',
        subtitle: 'איך לכתוב, ומה לא לכתוב אף פעם',
        isAnswered: () => true,
    },
    {
        key: 'tradition',
        title: 'מסורת ותרבות',
        subtitle: 'מאילו עולמות לשאוב השראה',
        isAnswered: () => true,
    },
    {
        key: 'rhythm',
        title: 'הקצב שלך',
        subtitle: 'מתי להזכיר, ומתי לקבל את המגילה השבועית',
        isAnswered: () => true,
    },
];

/** The next getting-to-know question for today, or null (one per day). */
export function nextWeeklyQuestion(p: UserProfile, today: string): Question | null {
    if (p.last_question_date === today) return null;
    return WEEK_ONE.find((q) => !p.answered_questions.includes(q.key)) || null;
}

export const BELIEFS = ['חילוני', 'מסורתי', 'דתי', 'רוחני', 'נוצרי', 'מוסלמי', 'אחר'];
export const VALUES = ['משפחה', 'חופש', 'משמעות', 'צמיחה', 'שפע', 'רוחניות', 'עומק רגשי', 'שקט', 'נתינה', 'אמת', 'בריאות', 'יצירה'];
export const STATES = ['מחפש/ת כיוון', 'ביציבות', 'בשינוי גדול', 'עייפות רגשית', 'בתנופת עשייה', 'בתהליך ריפוי'];
export const STRENGTHS = ['הקשבה', 'רגישות', 'אומץ', 'חוסן', 'יצירתיות', 'מנהיגות', 'התמדה', 'הומור', 'סקרנות', 'נתינה'];
export const WORK = ['הישרדות', 'בנייה', 'התרחבות', 'שפע', 'חיפוש כיוון', 'איזון'];
export const RELATIONSHIP_STATUS = ['לבד, וזה בסדר', 'מחפש/ת זוגיות', 'בזוגיות', 'נשוי/אה', 'אחרי פרידה', 'מעדיף/ה לא לפרט'];
export const RELATIONSHIP_APPROACH = ['בעדינות ורגישות', 'בישירות ופרקטיות', 'כמיהה לעתיד', 'חיזוק הקיים', 'לא להזכיר בכלל'];
export const BOUNDARIES = ['שפה דתית', 'אלוהים', 'שפה מינית', 'רגשני מדי', 'רוחני מדי'];
export const TRADITIONS = ['פרקי אבות', 'תנ"ך', 'קבלה', 'הסטואה', 'פסיכולוגיה', 'בודהיזם', 'נצרות', 'אסלאם', 'אחר'];
export const TONES: { value: UserProfile['tone']; label: string }[] = [
    { value: 'Adaptive', label: 'מותאם לרגע' },
    { value: 'Direct', label: 'ישיר' },
    { value: 'Soft', label: 'רך' },
    { value: 'Poetic', label: 'פיוטי' },
];
export const SCROLL_TIMING: { value: UserProfile['scroll_timing']; label: string }[] = [
    { value: 'friday', label: 'ביום שישי, לפני השבת' },
    { value: 'shabbat', label: 'בשבת' },
    { value: 'motzash', label: 'במוצאי שבת' },
];
