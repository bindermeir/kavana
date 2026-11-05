import type { UserProfile } from './types';

/**
 * Mincha: the midday reset (up to 60 seconds).
 * Stop (cyclic sighing) → look inward (name the feeling) → return (to the morning).
 * No AI here on purpose: it must be instant.
 */
export interface Feeling {
    label: string;
    hard: boolean;
}

export const FEELINGS: Feeling[] = [
    { label: 'רגוע', hard: false },
    { label: 'ממוקד', hard: false },
    { label: 'מודה', hard: false },
    { label: 'עייף', hard: true },
    { label: 'לחוץ', hard: true },
    { label: 'מוצף', hard: true },
    { label: 'מתוסכל', hard: true },
    { label: 'עצוב', hard: true },
    { label: 'מפוזר', hard: true },
    { label: 'כועס', hard: true },
];

/** Neff's self-compassion break, in three short lines. */
export function compassionLines(gender: UserProfile['gender']): string[] {
    const f = gender === 'f';
    return [
        'זה רגע קשה.',
        'קושי הוא חלק מהחיים. אני לא לבד בזה.',
        f
            ? 'מה הייתי אומרת עכשיו לחברה טובה? את זה אני אומרת לעצמי.'
            : gender === 'm'
                ? 'מה הייתי אומר עכשיו לחבר טוב? את זה אני אומר לעצמי.'
                : 'מה הייתי רוצה לשמוע עכשיו מחבר קרוב? את זה אפשר לומר גם לעצמי.',
    ];
}

// When there is no morning kavana to return to: a Stoic or Avot line, by belief world.
const STOIC = [
    { text: 'יש דברים שבידינו ויש דברים שאינם בידינו. השקיעו רק בראשונים.', ref: 'אפיקטטוס' },
    { text: 'אין לך אלא הרגע הזה. עשה בו את הדבר הבא, היטב.', ref: 'ברוח מרקוס אורליוס' },
    { text: 'לא הדברים מטרידים אותנו, אלא הדעות שלנו עליהם.', ref: 'אפיקטטוס' },
];
const AVOT = [
    { text: 'לֹא עָלֶיךָ הַמְּלָאכָה לִגְמֹר, וְלֹא אַתָּה בֶן חוֹרִין לְהִבָּטֵל מִמֶּנָּה.', ref: 'פרקי אבות ב, טז' },
    { text: 'אִם לֹא עַכְשָׁיו, אֵימָתַי?', ref: 'פרקי אבות א, יד' },
    { text: 'אֵיזֶהוּ עָשִׁיר? הַשָּׂמֵחַ בְּחֶלְקוֹ.', ref: 'פרקי אבות ד, א' },
];

export function fallbackReturnLine(profile: UserProfile | null, seed: number): { text: string; ref: string } {
    const b = profile?.belief_system || '';
    const religiousOk = !(profile?.content_boundaries || []).some((x) => /שפה דתית|אלוהים/.test(x));
    const pool = religiousOk && /דתי|מסורתי/.test(b) ? AVOT : /חילוני/.test(b) || !religiousOk ? STOIC : [...AVOT, ...STOIC];
    return pool[seed % pool.length];
}

/** Gendered display of a feeling chip ("עייף" / "עייפה"). */
export function feelingLabel(label: string, gender: UserProfile['gender']): string {
    if (gender !== 'f') return label;
    const fem: Record<string, string> = {
        'רגוע': 'רגועה', 'ממוקד': 'ממוקדת', 'מודה': 'מודה', 'עייף': 'עייפה', 'לחוץ': 'לחוצה',
        'מוצף': 'מוצפת', 'מתוסכל': 'מתוסכלת', 'עצוב': 'עצובה', 'מפוזר': 'מפוזרת', 'כועס': 'כועסת',
    };
    return fem[label] || label;
}
