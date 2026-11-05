# מסירה לסשן מקומי: העלאת כוונה v2 לאוויר

> הקובץ הזה מיועד לסשן Claude שרץ על המחשב של מאיר, עם Claude in Chrome.
> הקוד מוכן ב-branch `claude/kavana-v2`. נשארו רק הגדרות בממשקי Supabase, Vercel ו-GitHub.

## מצב נוכחי
- **הקוד:** branch `claude/kavana-v2`. הבנייה, `tsc` ו-`eslint` עוברים נקי. עוד לא מוזג ל-`main`.
- **Supabase:** הפרויקט `knnsdwvusbnidloyvugb` משותף עם אפליקציה אחרת של מאיר.
  כוונה יושבת בסכמה נפרדת בשם `kavana`.
  - ✅ `supabase/schema.sql` כבר הורץ בהצלחה.
  - ✅ נבדק שאין triggers על `auth.users`.
- **Vercel:** הפרויקט שמגיש את `prayer-app-sand.vercel.app` עדיין מריץ את הגרסה הישנה.

## מה נשאר לעשות, לפי הסדר
1. **Supabase ← Settings ← API (Data API):** להוסיף את `kavana` ל-**Exposed schemas** ולשמור.
2. **Supabase ← Authentication ← URL Configuration ← Redirect URLs:** להוסיף `https://prayer-app-sand.vercel.app/auth/callback`.
   **לא לשנות את Site URL**, כי הוא שייך לאפליקציה השנייה.
3. **Supabase ← Authentication ← Providers:** אם רוצים כניסה עם Google, לוודא שהוא מופעל.
4. **Vercel ← Project ← Settings ← Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://knnsdwvusbnidloyvugb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = מפתח ה-anon/publishable מ-Supabase ← Settings ← API
   - `GEMINI_API_KEY` = מפתח Gemini של מאיר
   - `ADMIN_EMAILS` = `bindermeir@gmail.com`
   - **לא להוסיף** `SUPABASE_SERVICE_ROLE_KEY`. בפרויקט משותף הוא פותח גישה גם לנתונים של האפליקציה השנייה. בלעדיו הכל עובד חוץ ממסך האדמין.
   - אם קיימים משתנים ישנים שמצביעים על הפרויקט הישן (`brgnfbxxpbiztgxblntu`), להחליף אותם.
5. **GitHub:** לפתוח Pull Request מ-`claude/kavana-v2` אל `main`, ולמזג רק באישור של מאיר.
6. **אחרי הפריסה, בדיקה מקצה לקצה באתר החי:**
   הרשמה ← היכרות (שלוש שאלות) ← שחרית ← מנחה ← ערבית ← הספר ← שיתוף משפט היום.

## מסמכים
- [`PHILOSOPHY.md`](../PHILOSOPHY.md): הרעיון וההחלטות.
- [`docs/METHODS.md`](METHODS.md): השיטות שמזינות את ה-AI.
- [`docs/MENORAH_SOURCES.md`](MENORAH_SOURCES.md): המקורות על המנורה.
- [`docs/PLAN.md`](PLAN.md): תוכנית העבודה.
