'use client';

import Sheet from '@/components/ui/Sheet';
import Menorah from './Menorah';

/** "The secret of the menorah": the hidden layer, for whoever looks for it. */
export default function MenorahSecret({ onClose }: { onClose: () => void }) {
    return (
        <Sheet title="סוד המנורה" onClose={onClose}>
            <div className="space-y-5 leading-relaxed text-text-primary">
                <div className="flex justify-center py-2">
                    <Menorah litThrough={6} levels={[3, 3, 3, 3, 3, 3, 3]} className="w-44" />
                </div>
                <p>
                    השנה הולכת לפי השמש, החודש לפי הירח, והיום לפי הזריחה והשקיעה.
                    <strong> השבוע לא קשור לגרמי השמיים. הוא ספירה בידי אדם.</strong>
                </p>
                <p>
                    לכן המנורה כאן היא לא קישוט. היא השבוע שלך. בכל יום מתווסף נר: שחרית מדליקה אותו, מנחה מוסיפה לו שמן,
                    וערבית מוסיפה לו אור. וגם ביום שלא הגעת, בערב הנר נדלק בכל זאת. בשבת המנורה שלמה, וכל האור של השבוע נאסף למגילה אחת.
                </p>
                <p>
                    <strong>נר תמיד.</strong> במקדש המנורה מעולם לא הייתה חשוכה לגמרי. בבוקר &quot;מטיבים&quot; את הנרות, ולפי הרמב&quot;ם
                    &quot;הַדְלָקַת הַנֵּרוֹת הִיא הֲטָבָתָם&quot;. ההטבה נעשתה בשני חלקים, חמישה נרות ואחר כך שניים, &quot;כְּדֵי לְהַרְגִּישׁ אֶת כָּל הָעֲזָרָה&quot;.
                </p>
                <p>
                    <strong>נר מערבי שלא כבה.</strong> הנר של יום ראשון דולק לאורך כל השבוע, &quot;מִמֶּנָּה הָיָה מַדְלִיק וּבָהּ הָיָה מְסַיֵּים&quot;: הכוונה הראשונה ממשיכה להאיר עד השבת.
                </p>
                <p>
                    <strong>הנר האמצעי.</strong> ביום הרביעי נבראו המאורות, ולכן הנר האמצעי זוהר אחרת. כבר יוסף בן מתתיהו ופילון ראו בשבעת הנרות את שבעת כוכבי הלכת, ובנר האמצעי את השמש.
                    לפי הרמב&quot;ם, הנר המערבי הוא האמצעי, וכך גם בלוח בני צדוק: השנה מתחילה ביום רביעי, והשבת היא הציר.
                </p>
                <p className="text-sm text-text-secondary">
                    במקורות יש מחלוקת מהו הנר המערבי. זו הקריאה שלנו, ולא הכרעה.
                </p>
            </div>
        </Sheet>
    );
}
