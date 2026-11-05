'use client';

import Sheet from '@/components/ui/Sheet';
import Menorah from './Menorah';

/** "The secret of the menorah": the hidden layer, for whoever looks for it. */
export default function MenorahSecret({ onClose }: { onClose: () => void }) {
    return (
        <Sheet title="סוד המנורה" onClose={onClose}>
            <div className="space-y-5 leading-relaxed text-text-primary">
                <div className="flex justify-center py-2">
                    <Menorah litThrough={6} levels={[3, 3, 3, 3, 3, 3, 3]} className="w-40" />
                </div>
                <p>
                    השנה הולכת לפי השמש, החודש לפי הירח, והיום לפי הזריחה והשקיעה.
                    <strong> השבוע לא קשור לגרמי השמיים. הוא ספירה בידי אדם.</strong>
                </p>
                <p>
                    לכן המנורה כאן היא לא קישוט. היא השבוע שלך. בכל יום מתווסף נר, וכל רגע של התכווננות
                    (שחרית, מנחה, ערבית) מגביר את הלהבה שלו. בשבת המנורה שלמה, וכל האור של השבוע נאסף למגילה אחת.
                </p>
                <p>
                    <strong>נר מערבי שלא כבה.</strong> הנר של יום ראשון דולק לאורך כל השבוע: הכוונה הראשונה ממשיכה להאיר עד השבת.
                </p>
                <p>
                    <strong>הנר האמצעי.</strong> ביום הרביעי נבראו המאורות, ולכן הנר האמצעי זוהר אחרת.
                    לפי הרמב&quot;ם, הנר המערבי הוא האמצעי, וכך גם בלוח בני צדוק: השנה מתחילה ביום רביעי, והשבת היא הציר.
                </p>
                <p className="text-sm text-text-secondary">
                    במקורות יש מחלוקת מהו הנר המערבי. זו הקריאה שלנו, ולא הכרעה.
                </p>
            </div>
        </Sheet>
    );
}
