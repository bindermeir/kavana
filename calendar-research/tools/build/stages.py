"""Stage (layer) definitions: which texts enter at which stage, by the dating of mainstream scholarship.
Each layer is added cumulatively: stage N corpus = layers 1..N."""
HEB = {'Gen':'בראשית','Exod':'שמות','Lev':'ויקרא','Num':'במדבר','Deut':'דברים','Josh':'יהושע','Judg':'שופטים',
 '1Sam':'שמואל א','2Sam':'שמואל ב','1Kgs':'מלכים א','2Kgs':'מלכים ב','Isa':'ישעיהו','Jer':'ירמיהו','Ezek':'יחזקאל',
 'Hos':'הושע','Joel':'יואל','Amos':'עמוס','Obad':'עובדיה','Jonah':'יונה','Mic':'מיכה','Nah':'נחום','Hab':'חבקוק',
 'Zeph':'צפניה','Hag':'חגי','Zech':'זכריה','Mal':'מלאכי','Ps':'תהלים','Prov':'משלי','Job':'איוב','Song':'שיר השירים',
 'Ruth':'רות','Lam':'איכה','Eccl':'קהלת','Esth':'אסתר','Dan':'דניאל','Ezra':'עזרא','Neh':'נחמיה','1Chr':'דברי הימים א','2Chr':'דברי הימים ב'}
# unit kinds: ('torah', book, source) | ('tanakh', book, ch_from, ch_to) | ('enoch', ch_from, ch_to) | ('jub',) | ('qumran', [scrolls]) | ('qumran_rest',)
LAYERS = [
 dict(n=1, title='התורה - השכבה הלא-כוהנית (JE)', dating='בערך המאה ה-10 עד ה-8 לפנה"ס',
      units=[('torah',b,'JE') for b in ('Gen','Exod','Num')]),
 dict(n=2, title='נביאי המאה ה-8 לפנה"ס', dating='בערך 760-700 לפנה"ס',
      units=[('tanakh','Amos',1,9),('tanakh','Hos',1,14),('tanakh','Mic',1,3),('tanakh','Isa',1,23),('tanakh','Isa',28,33)]),
 dict(n=3, title='ספר דברים, ההיסטוריה הדויטרונומיסטית ונביאי המאה ה-7', dating='בערך 640-560 לפנה"ס',
      units=[('torah','Deut','D'),('tanakh','Josh',1,24),('tanakh','Judg',1,21),('tanakh','1Sam',1,31),('tanakh','2Sam',1,24),
             ('tanakh','1Kgs',1,22),('tanakh','2Kgs',1,25),('tanakh','Isa',36,39),('tanakh','Zeph',1,3),('tanakh','Nah',1,3),
             ('tanakh','Hab',1,3),('tanakh','Jer',1,52)]),
 dict(n=4, title='תקופת הגלות: המקור הכוהני (P) וקובץ הקדושה (H), יחזקאל, ישעיהו השני, איכה', dating='בערך 590-520 לפנה"ס',
      units=[('torah',b,s) for b in ('Gen','Exod','Lev','Num','Deut') for s in ('P','H')]+
            [('tanakh','Ezek',1,48),('tanakh','Isa',34,35),('tanakh','Isa',40,55),('tanakh','Lam',1,5),('tanakh','Obad',1,1)]),
 dict(n=5, title='התקופה הפרסית', dating='בערך 520-330 לפנה"ס',
      units=[('tanakh','Hag',1,2),('tanakh','Zech',1,8),('tanakh','Isa',56,66),('tanakh','Mal',1,3),('tanakh','Joel',1,4),
             ('tanakh','Mic',4,7),('tanakh','Jonah',1,4),('tanakh','Ruth',1,4),('tanakh','Job',1,42),('tanakh','Prov',1,31),
             ('tanakh','Ps',1,150),('tanakh','Ezra',1,10),('tanakh','Neh',1,13),('tanakh','1Chr',1,29),('tanakh','2Chr',1,36)]),
 dict(n=6, title='התקופה ההלניסטית המוקדמת: קהלת, אסתר, שיר השירים, זכריה ט-יד, ישעיהו כד-כז, חנוך הקדום', dating='בערך 330-200 לפנה"ס',
      units=[('tanakh','Eccl',1,12),('tanakh','Esth',1,10),('tanakh','Song',1,8),('tanakh','Zech',9,14),('tanakh','Isa',24,27),
             ('enoch',1,36),('enoch',72,82),
             ('qumran',['4Q201','4Q202','4Q208','4Q209','4Q210','4Q211','1Q21','4Q213','4Q213a','4Q213b','4Q214','4Q214a','4Q214b'])]),
 dict(n=7, title='המאה ה-2 לפנה"ס: דניאל, היובלים, חלקי חנוך המאוחרים, מגילת המקדש, מקצת מעשי התורה', dating='בערך 200-100 לפנה"ס',
      units=[('tanakh','Dan',1,12),('enoch',83,90),('enoch',91,107),('jub',),
             ('qumran',['4Q203','4Q204','4Q205','4Q206','4Q207','4Q212','1Q23','2Q26','4Q530','4Q531','4Q532','4Q533','6Q8',
                        '1Q17','1Q18','2Q19','2Q20','3Q5','4Q216','4Q217','4Q218','4Q219','4Q220','4Q221','4Q222','4Q223_224','11Q12',
                        '4Q225','4Q226','4Q227','4Q228','11Q19','11Q20','11Q21','4Q524','4Q365a',
                        '4Q394','4Q395','4Q396','4Q397','4Q398','4Q399','4Q242','4Q243','4Q244','4Q245','4Q246'])]),
 dict(n=8, title='שאר כתבי קומראן (כתבי העדה, הלוחות הקלנדריים ועוד) וחלקי חנוך שלא נמצאו בקומראן', dating='בערך 150 לפנה"ס עד 68 לספירה',
      units=[('qumran_rest',),('enoch',37,71),('enoch',108,108)]),
]
