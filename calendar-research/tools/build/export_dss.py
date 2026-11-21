"""Export ETCBC/dss (Abegg transcriptions) to plain text, one file per scroll.
Conventions in output:
  [ ... ]  = letters RECONSTRUCTED by a modern editor (not physically on the scroll)
  {N}      = ancient numeral signs, summed to their numeric value (e.g. {4})
  ◦        = missing / illegible sign
  ^ ... ^  = supralinear ancient correction
Line prefix: fragment/column:line   (biblical scrolls also give [book ch:vs])."""
import sys, os, collections
from tf.fabric import Fabric
src, out = sys.argv[1], sys.argv[2]
TF = Fabric(locations=src, silent='deep')
api = TF.load('scroll fragment line biblical glyph punc after type rec cor book chapter verse lang', silent='deep')
F, L = api.F, api.L
NUM = {'א֜':1,'אׄ':1,'אׅ':1,'אֽ':1,'י֜':10,'ך֜':20,'ק֜':100}
def word_text(w):
    out=[]; inrec=False; numacc=None
    def flushnum():
        nonlocal numacc
        if numacc is not None: out.append('{%d}'%numacc); numacc=None
    for s in L.d(w, otype='sign'):
        t=F.type.v(s); g=F.glyph.v(s) or ''
        r = F.rec.v(s)==1
        if r and not inrec: flushnum(); out.append('['); inrec=True
        if not r and inrec: flushnum(); out.append(']'); inrec=False
        if t=='numr':
            numacc=(numacc or 0)+NUM.get(g,0); continue
        if t=='add': continue
        flushnum()
        if t=='missing': out.append('◦')
        elif t in ('cons','sep','punct','vwl'): out.append(g)
        elif t=='term': pass
        else: out.append(g.strip())
    flushnum()
    if inrec: out.append(']')
    return ''.join(out).replace('][','')
os.makedirs(out+'/nonbiblical',exist_ok=True); os.makedirs(out+'/biblical',exist_ok=True)
index=[]
for s in F.otype.s('scroll'):
    name=F.scroll.v(s); words=L.d(s,otype='word')
    bib=any(F.biblical.v(w) for w in words[:50])
    langs=collections.Counter(F.lang.v(w) or 'h' for w in words)
    lines=[]
    for fr in L.d(s,otype='fragment'):
        for ln in L.d(fr,otype='line'):
            ws=L.d(ln,otype='word')
            txt=''.join(word_text(w)+(F.punc.v(w) or '')+(F.after.v(w) or '') for w in ws).replace('] [',' ').replace('][','').strip()
            extra=''
            if bib:
                b=[w for w in ws if F.book.v(w)]
                if b: extra=f' [{F.book.v(b[0])} {F.chapter.v(b[0])}:{F.verse.v(b[0])}]'
            lines.append(f'{F.fragment.v(fr)}:{F.line.v(ln)}{extra}\t{txt}')
    sub='biblical' if bib else 'nonbiblical'
    lang='aramaic' if langs.get('a',0)>langs.get('h',0) else 'hebrew'
    with open(f'{out}/{sub}/{name.replace("/","_")}.txt','w') as f:
        f.write(f'# {name}  (language: {lang})\n'+'\n'.join(lines)+'\n')
    index.append((sub,name,lang,len(lines)))
with open(out+'/INDEX.tsv','w') as f:
    f.write('collection\tscroll\tlanguage\tlines\n')
    for r in index: f.write('\t'.join(map(str,r))+'\n')
print(len(index))
