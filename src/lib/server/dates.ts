import { HttpError } from '../supabase-server';
import { isDateStr, localDateStr, parseLocalDate } from '../dates';

/**
 * The client sends its own local date (so "today" follows the user's clock).
 * We accept it only if it is within two days of the server's date.
 */
export function requireClientDate(v: unknown): string {
    if (!isDateStr(v)) throw new HttpError(400, 'Invalid date');
    const diff = Math.abs(parseLocalDate(v).getTime() - parseLocalDate(localDateStr()).getTime());
    if (diff > 2 * 86400000) throw new HttpError(400, 'Date out of range');
    return v;
}
