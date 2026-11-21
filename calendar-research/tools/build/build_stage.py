"""Build sandbox/stage-NN: cumulative corpus of layers 1..N + astronomy tables. Usage: build_stage.py ROOT N"""
import sys, os, re, json, shutil, xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(__file__))
from stages import LAYERS, HEB
ROOT, N = sys.argv[1], int(sys.argv[2])
WLC = f'{ROOT}/_downloads/morphhb/wlc'; DSS = f'{ROOT}/_work/dss_txt'; DEUT = f'{ROOT}/_downloads/bible_databases_deuterocanonical/sources/en'
NS = '{http://www.bibletechnologies.net/2003/OSIS/namespace}'
CANT = re.compile('[֑-ֽ֯׀׃׆]')   # cantillation, meteg, paseq, sof pasuq handled separately
POINTS = re.compile('[֑-ׇ]')
def load_book(b):
    root = ET.parse(f'{WLC}/{b}.xml').getroot(); verses = {}
    for v in root.iter(NS+'verse'):
        _, c, vs = v.get('osisID').split('.')
        parts = []
        def walk(el):
            for ch in el:
                tag = ch.tag.replace(NS, '')
                if tag == 'note': pass
                elif tag == 'w': parts.append(('w', (ch.text or '').replace('/', '')))
                elif tag == 'seg':
                    t = ch.get('type')
                    if t == 'x-maqqef': parts.append(('m', '־'))
                    elif t == 'x-pe': parts.append(('p', ' {פ}'))
                    elif t == 'x-samekh': parts.append(('p', ' {ס}'))
                    elif t == 'x-sof-pasuq': parts.append(('p', '׃'))
                else: walk(ch)
                if tag != 'note' and ch.tail and ch.tail.strip(): pass
        walk(v)
        out = ''
        for k, t in parts:
            if k == 'w': out += ('' if out.endswith('־') or not out else ' ') + t
            else: out += t
        verses[(int(c), int(vs))] = out.strip()
    return verses
def split_half(text, half):
    i = text.find('֑')  # atnach
    if i < 0: return text
    j = text.find(' ', i)
    a, b = (text[:j], text[j:]) if j > 0 else (text, '')
    return a.strip() if half == 'a' else b.strip()
def pointed(t): return CANT.sub('', t)
def consonantal(t): return POINTS.sub('', t.replace('־', ' '))
# source map
SRC = {}
def parse_ref(s):
    m = re.match(r'(\d+):(\d+)([ab]?)$', s); return int(m[1]), int(m[2]), m[3]
for line in open(f'{ROOT}/methodology/pentateuch_sources.tsv', encoding='utf8'):
    if line.startswith('#') or not line.strip(): continue
    f = line.rstrip('\n').split('\t'); b, rng, src = f[0], f[1], f[2]
    lo, hi = (rng.split('-') + [None])[:2]
    c1, v1, h1 = parse_ref(lo)
    if hi is None: c2, v2, h2 = c1, v1, h1
    elif ':' in hi: c2, v2, h2 = parse_ref(hi)
    else: m = re.match(r'(\d+)([ab]?)$', hi); c2, v2, h2 = c1, int(m[1]), m[2]
    SRC.setdefault(b, []).append(((c1, v1, h1), (c2, v2, h2), src))
DEFAULT = {'Gen': 'JE', 'Exod': 'JE', 'Num': 'JE', 'Lev': 'P', 'Deut': 'D'}
def source_of(b, c, v):
    """returns dict half->source, half in {'', 'a', 'b'}"""
    res = {'a': DEFAULT[b], 'b': DEFAULT[b]}
    for (c1, v1, h1), (c2, v2, h2), s in SRC.get(b, []):
        if (c1, v1) <= (c, v) <= (c2, v2):
            ha = 'a' if (c, v) != (c1, v1) or h1 in ('', 'a') else None
            hb = 'b' if (c, v) != (c2, v2) or h2 in ('', 'b') else None
            if (c, v) == (c1, v1) and h1 == 'b': ha = None
            if (c, v) == (c2, v2) and h2 == 'a': hb = None
            if ha: res['a'] = s
            if hb: res['b'] = s
    return res
STAGE = f'{ROOT}/sandbox/stage-{N:02d}'
if os.path.exists(STAGE + '/corpus'): shutil.rmtree(STAGE + '/corpus')
os.makedirs(STAGE + '/corpus', exist_ok=True); os.makedirs(STAGE + '/output', exist_ok=True)
cache = {}
manifest = []
SRCNAME = {'JE': 'שכבה לא-כוהנית (JE)', 'D': 'ספר דברים (D)', 'P': 'המקור הכוהני (P)', 'H': 'קובץ הקדושה (H)'}
def write(path, header, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf8') as f: f.write(header + '\n' + '\n'.join(lines) + '\n')
used_q = set()
for L in LAYERS[:N]:
    ld = f'{STAGE}/corpus/layer-{L["n"]}'
    for u in L['units']:
        if u[0] in ('torah', 'tanakh'):
            b = u[1]
            if b not in cache: cache[b] = load_book(b)
            V = cache[b]; outc, outp = [], []
            for (c, v), t in sorted(V.items()):
                if u[0] == 'tanakh':
                    if not (u[2] <= c <= u[3]): continue
                    ref, txt = f'{c}:{v}', t
                else:
                    s = source_of(b, c, v)
                    if s['a'] == s['b']:
                        if s['a'] != u[2]: continue
                        ref, txt = f'{c}:{v}', t
                    elif s['a'] == u[2]: ref, txt = f'{c}:{v}א', split_half(t, 'a')
                    elif s['b'] == u[2]: ref, txt = f'{c}:{v}ב', split_half(t, 'b')
                    else: continue
                outc.append(f'{ref}\t{consonantal(txt)}'); outp.append(f'{ref}\t{pointed(txt)}')
            if not outc: continue
            if u[0] == 'torah': name = f'{HEB[b]} - {SRCNAME[u[2]]}'; fn = f'{b}_{u[2]}'
            else:
                rng = '' if (u[2], u[3]) == (1, max(c for c, _ in V)) else f' פרקים {u[2]}-{u[3]}'
                name = f'{HEB[b]}{rng}'; fn = f'{b}_{u[2]}-{u[3]}'
            hdr = f'# {name}\n# שכבה {L["n"]}: {L["title"]} ({L["dating"]})\n# נוסח המסורה (כתב יד לנינגרד), טקסט עיצורי בלבד. פורמט: פרק:פסוק<TAB>טקסט. {{פ}}/{{ס}} = פרשה פתוחה/סתומה. א/ב = חצי פסוק.'
            write(f'{ld}/{fn}.txt', hdr, outc)
            write(f'{ld}/pointed/{fn}.txt', hdr.replace('טקסט עיצורי בלבד', 'עם ניקוד המסורה (ללא טעמים) - הניקוד הוא תוספת מאוחרת, לעיון משני בלבד'), outp)
            manifest.append((L['n'], name, f'layer-{L["n"]}/{fn}.txt', len(outc)))
        elif u[0] in ('enoch', 'jub'):
            fn = '1-enoch/1-enoch.json' if u[0] == 'enoch' else 'book-of-jubilees/book-of-jubilees.json'
            chs = json.load(open(f'{DEUT}/{fn}'))['books'][0]['chapters']
            out = []
            for c in chs:
                if u[0] == 'enoch' and not (u[1] <= c['chapter'] <= u[2]): continue
                for v in c['verses']:
                    t = v['text']
                    t = re.sub(r'\s*\[\d[\d\s\-–]*A\.\s?M\.?\]', '', t)          # Charles' Anno Mundi computations
                    t = re.sub(r'\s*\[\d+:\d+[a-z]?\]', '', t)                   # cross references
                    t = re.sub(r'\s*\((?:lit\.|i\.e\.|cf\.|Gr\.|Eth\.|or )[^)]*\)', '', t)  # translator notes
                    out.append(f'{c["chapter"]}:{v["verse"]}\t{t.strip()}')
            if u[0] == 'enoch':
                name = f'ספר חנוך א פרקים {u[1]}-{u[2]}'; f2 = f'1Enoch_{u[1]}-{u[2]}'
            else: name = 'ספר היובלים'; f2 = 'Jubilees'
            hdr = (f'# {name}\n# שכבה {L["n"]}: {L["title"]} ({L["dating"]})\n'
                   '# הנוסח המלא שרד רק בגעז (אתיופית). כאן: תרגום אנגלי של R.H. Charles (1917), נחלת הכלל. הוסרו חישובי שנים, הפניות והערות המתרגם.\n'
                   '# מילים בסוגריים עגולים ( ) הן השלמות של המתרגם לצורך התחביר. השוואה לקטעים המקוריים מקומראן מומלצת היכן שקיימים.')
            write(f'{ld}/{f2}.txt', hdr, out); manifest.append((L['n'], name, f'layer-{L["n"]}/{f2}.txt', len(out)))
        elif u[0] in ('qumran', 'qumran_rest'):
            if u[0] == 'qumran': names = u[1]
            else:
                allq = sorted(x[:-4] for x in os.listdir(f'{DSS}/nonbiblical'))
                names = [x for x in allq if x not in used_q]
            for q in names:
                p = f'{DSS}/nonbiblical/{q}.txt'
                if not os.path.exists(p): print('missing', q); continue
                used_q.add(q)
                txt = open(p, encoding='utf8').read().split('\n', 1)
                note = ''
                if q == 'CD': note = '\n# שים לב: "ברית דמשק" - העותק הזה נמצא בגניזת קהיר (ימי הביניים). עותקים קדומים של אותו חיבור נמצאו בקומראן (4Q266-273).'
                hdr = (f'{txt[0]}\n# שכבה {L["n"]}: {L["title"]} ({L["dating"]})\n'
                       '# תעתיק Abegg. סימון: [ ] = אותיות שהושלמו ע"י עורך מודרני (לא נראות בכתב היד); {N} = סימני מספר קדומים, בערכם המספרי; ◦ = אות חסרה/לא קריאה; # = אות לא ודאית. פורמט: עמודה/קטע:שורה<TAB>טקסט' + note)
                write(f'{ld}/qumran/{q}.txt', hdr, [txt[1].rstrip('\n')])
                manifest.append((L['n'], f'קומראן {q}', f'layer-{L["n"]}/qumran/{q}.txt', txt[1].count('\n')))
    if L['n'] < N: pass
# astronomy
if os.path.exists(STAGE + '/astronomy'): shutil.rmtree(STAGE + '/astronomy')
shutil.copytree(f'{ROOT}/_work/astronomy', STAGE + '/astronomy')
with open(f'{STAGE}/corpus/MANIFEST.tsv', 'w', encoding='utf8') as f:
    f.write('שכבה\tיחידה\tקובץ\tשורות\n' + '\n'.join('\t'.join(map(str, r)) for r in manifest) + '\n')
shutil.copy(f'{ROOT}/tools/build/sandbox_readme.md', STAGE + '/README.md')
print(STAGE, len(manifest), 'units')
