# כוונה (Kavana)

התכווננות יומית במינימום זמן. שלושה רגעים ביום (שחרית, מנחה, ערבית), שבעה נרות בשבוע, ומגילה כשהמנורה שלמה.

- **הפילוסופיה:** [`PHILOSOPHY.md`](PHILOSOPHY.md)
- **השיטות והמחקר:** [`docs/METHODS.md`](docs/METHODS.md)
- **תוכנית העבודה:** [`docs/PLAN.md`](docs/PLAN.md)

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # ולמלא את הערכים
npm run dev
```

## הקמת מסד הנתונים

ב-Supabase: SQL Editor ← להדביק את [`supabase/schema.sql`](supabase/schema.sql) ← Run.
לכל טבלה יש Row Level Security: כל משתמש רואה רק את השורות שלו.

לכניסה עם Google: Authentication ← Providers ← Google, ולהוסיף את `https://<הדומיין>/auth/callback` ל-Redirect URLs.

## מבנה

| תיקייה | מה יש בה |
|---|---|
| `src/app/api/*` | נתיבי השרת: `kavana` (שחרית), `asif` (ערבית), `offload`, `scroll` (המגילה), `admin` |
| `src/lib/ai/` | החיבור ל-Gemini, הפרומפטים והקשר לוח השנה |
| `src/components/app/` | מעטפת האפליקציה: היום, הספר, יש בי, אני |
| `src/components/moments/` | שלושת הרגעים |
| `src/components/menorah/` | המנורה ו"סוד המנורה" |
| `src/lib/share/` | יצירת כרטיס הסטורי |

## אבטחה

- כל נתיב API מאמת את ה-token של המשתמש ופועל בשמו, דרך RLS.
- האדמין נקבע לפי `ADMIN_EMAILS` בשרת. אין סיסמה בקוד.
- `SUPABASE_SERVICE_ROLE_KEY` משמש רק בשרת, רק אחרי בדיקת אדמין.
