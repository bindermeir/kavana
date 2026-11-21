"""Precompute neutral astronomical tables for Jerusalem, 1000 BCE - 70 CE.
Uses PyEphem (VSOP87/ELP; built-in Delta-T). Dates: proleptic Julian calendar,
historical numbering as used by PyEphem: no year 0, -700 = 700 BCE, -1 = 1 BCE. Times local mean solar (UT+2h21m).
Crescent visibility: Yallop (1997) q-test at 'best time' (sunset + 4/9 lag)."""
import ephem, math, sys, os
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
LAT,LON,EL='31.778','35.235',750
LOCAL=35.235/15/24  # days
DOW=['ב','ג','ד','ה','ו','ש','א']  # ephem: Date weekday? we compute from JD
def jd(d): return ephem.julian_date(d)
def dow(j):  # JD -> weekday name (0=Monday at JD noon convention)
    return ['שני','שלישי','רביעי','חמישי','שישי','שבת','ראשון'][int(math.floor(j+0.5))%7]
def ymd(d):
    y,m,dd=ephem.Date(d+LOCAL).triple(); return y,m,int(dd)
def fmt(d):
    y,m,dd=ephem.Date(d+LOCAL).triple()
    hh=(dd-int(dd))*24; return f'{y}/{m:02d}/{int(dd):02d} {int(hh):02d}:{int((hh%1)*60):02d}'
def bce(y): return f'{-y} לפנה"ס' if y<0 else f'{y} לספירה'   # PyEphem has no year 0: -700 = 700 BCE
def obs(date):
    o=ephem.Observer(); o.lat=LAT; o.lon=LON; o.elevation=EL; o.pressure=0; o.horizon='-0:34'; o.date=date; return o
def yallop(o_date, evening=True):
    """Return q and details at best time for the evening (or morning) around o_date (a sunset/sunrise)."""
    sun=ephem.Sun(); moon=ephem.Moon()
    o=obs(o_date)
    if evening:
        ss=o.next_setting(sun, start=o_date-0.5); o.date=ss
        try: ms=o.next_setting(moon, start=ss-0.2)
        except Exception: return None
        if ms<ss: return dict(q=-9,lag=(ms-ss)*1440,t=ss)
        lag=ms-ss; tb=ss+4/9*lag
    else:
        sr=o.next_rising(sun, start=o_date-0.5); o.date=sr
        try: mr=o.previous_rising(moon, start=sr+0.2)
        except Exception: return None
        if mr>sr: return dict(q=-9,lag=(sr-mr)*1440,t=sr)
        lag=sr-mr; tb=sr-4/9*lag
    o2=obs(tb); o2.horizon='0'
    sun.compute(o2); moon.compute(o2)
    arcv=math.degrees(moon.alt-sun.alt)
    arcl=math.degrees(ephem.separation(moon,sun))
    sd=math.degrees(moon.radius)*60  # arcmin semi-diameter (topocentric)
    W=sd*(1-math.cos(math.radians(arcl)))
    q=(arcv-(11.8371-6.3226*W+0.7319*W**2-0.1018*W**3))/10
    return dict(q=q,lag=lag*1440,arcv=arcv,arcl=arcl,W=W,t=tb,alt=math.degrees(moon.alt))
def cls(q):
    return 'A' if q>0.216 else 'B' if q>-0.014 else 'C' if q>-0.160 else 'D' if q>-0.232 else 'E' if q>-0.293 else 'F'
start=ephem.Date('-1000/1/1'); end=ephem.Date('70/12/31')
rows=[]; d=ephem.previous_new_moon(start); n=0
while d<end:
    nm=ephem.next_new_moon(d+0.01); fm=ephem.next_full_moon(nm); nxt=ephem.next_new_moon(nm+1)
    # first evening crescent: evenings starting the evening of conjunction day
    first=None; ev=[]
    base=ephem.Date(math.floor(nm+LOCAL+0.5)-0.5-LOCAL+0.75)  # ~ local 18:00 on conjunction day
    for k in range(0,4):
        r=yallop(base+k,True)
        if r is None: continue
        ev.append((k,r))
        if first is None and r['q']>-0.014: first=(k,r)
    poss=next(((k,r) for k,r in ev if r['q']>-0.160),None)
    # last morning crescent before conjunction
    last=None
    mbase=ephem.Date(math.floor(nm+LOCAL+0.5)-0.5-LOCAL+0.25)  # ~ local 06:00 on conjunction day
    for k in range(0,4):
        r=yallop(mbase-k,False)
        if r and r['q']>-0.014: last=(k,r); break
    def evs(x):
        if not x: return '\t\t\t'
        k,r=x; y,m,dd=ymd(r['t']); j=jd(r['t'])
        return f'{y}/{m:02d}/{dd:02d}\t{dow(j)}\t{r["q"]:.3f}\t{cls(r["q"])}'
    y,_,_=ymd(nm)
    rows.append('\t'.join([str(n),bce(y),fmt(nm),dow(jd(nm)),f'{jd(nm):.3f}',fmt(fm),dow(jd(fm)),f'{(nxt-nm):.3f}',evs(first),evs(poss),evs(last)]))
    d=nm; n+=1
hdr='\t'.join(['מס_מולד','שנה','מולד_אסטרונומי(התקבצות)_זמן_מקומי','יום_בשבוע_התקבצות','JD_התקבצות','ירח_מלא_זמן_מקומי','יום_בשבוע_ירח_מלא','אורך_החודש_הסינודי_בימים',
 'ערב_ראייה_ראשונה(B+)','יום_בשבוע','q','סיווג','ערב_ראייה_אפשרית(C+)','יום_בשבוע','q','סיווג','בוקר_ראייה_אחרונה_לפני_ההתקבצות','יום_בשבוע','q','סיווג'])
open(f'{OUT}/lunations_jerusalem.tsv','w').write(hdr+'\n'+'\n'.join(rows)+'\n')
# seasons
srows=[]
d=start
while d<end:
    for name,fn in (('שוויון אביבי',ephem.next_vernal_equinox),('היפוך קיצי',ephem.next_summer_solstice),('שוויון סתווי',ephem.next_autumnal_equinox),('היפוך חורפי',ephem.next_winter_solstice)):
        e=fn(d); y,_,_=ymd(e); srows.append(f'{bce(y)}\t{name}\t{fmt(e)}\t{dow(jd(e))}\t{jd(e):.3f}')
    d=ephem.Date(d+365.2422)
open(f'{OUT}/seasons_jerusalem.tsv','w').write('שנה\tאירוע\tזמן_מקומי\tיום_בשבוע\tJD\n'+'\n'.join(srows)+'\n')
# daily sun for sample years 701 BCE and 200 BCE: sunrise/sunset/daylength/azimuth
for Y in (-701,-200):
    out=['תאריך_יוליאני\tזריחה\tשקיעה\tאורך_היום_שעות\tאורך_היום_ב-1/18\tאזימוט_זריחה_מעלות\tאזימוט_שקיעה_מעלות']
    d=ephem.Date(f'{Y}/1/1')
    for i in range(366):
        o=obs(d+i-LOCAL+0.5); s=ephem.Sun()
        sr=o.previous_rising(s); st=o.next_setting(s)
        o.date=sr; s.compute(o); azr=math.degrees(s.az); o.date=st; s.compute(o); azs=math.degrees(s.az)
        L=(st-sr)*24
        y,m,dd=ymd(d+i)
        out.append(f'{y}/{m:02d}/{dd:02d}\t{fmt(sr)[-5:]}\t{fmt(st)[-5:]}\t{L:.3f}\t{L/24*18:.2f}\t{azr:.1f}\t{azs:.1f}')
    open(f'{OUT}/daily_sun_{bce(Y).split()[0]}BCE.tsv','w').write('\n'.join(out)+'\n')
print(len(rows),'lunations', len(srows),'season events')
