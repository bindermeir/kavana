"""Solar and lunar eclipses visible from Jerusalem, 1000 BCE - 70 CE (PyEphem).
Solar: topocentric minimum Sun-Moon separation near each conjunction, with Sun above horizon.
  magnitude = fraction of solar diameter covered at maximum (at Jerusalem).
Lunar: at each full moon, geocentric Moon distance from the anti-solar point vs Earth's
  umbral/penumbral radii (Danjon-style 1.02 enlargement); visible if Moon above horizon at Jerusalem
  at some time during the umbral phase. Same date conventions as astro_tables.py."""
import ephem, math, sys
OUT=sys.argv[1]
LAT,LON,EL='31.778','35.235',750
LOCAL=35.235/15/24
def fmt(d):
    y,m,dd=ephem.Date(d+LOCAL).triple(); hh=(dd-int(dd))*24
    return f'{y}/{m:02d}/{int(dd):02d} {int(hh):02d}:{int((hh%1)*60):02d}'
def bce(y): return f'{-y} לפנה"ס' if y<0 else f'{y} לספירה'
def dow(j): return ['שני','שלישי','רביעי','חמישי','שישי','שבת','ראשון'][int(math.floor(j+0.5))%7]
def obs(d):
    o=ephem.Observer(); o.lat=LAT; o.lon=LON; o.elevation=EL; o.pressure=0; o.date=d; return o
sun=ephem.Sun(); moon=ephem.Moon()
solar=[]; lunar=[]
d=ephem.Date('-1000/1/1'); end=ephem.Date('70/12/31')
while d<end:
    nm=ephem.next_new_moon(d); fm=ephem.next_full_moon(d)
    # solar: scan +-4h around conjunction in 2-min steps
    best=None
    for k in range(-120,121):
        t=nm+k*2/1440; o=obs(t); sun.compute(o); moon.compute(o)
        sep=ephem.separation(sun,moon); rs=sun.radius; rm=moon.radius
        if sep<rs+rm and sun.alt>0:
            mag=(rs+rm-sep)/(2*rs)
            if best is None or mag>best[1]: best=(t,mag,math.degrees(sun.alt),rm>rs)
    if best:
        t,mag,alt,big=best; y=ephem.Date(t+LOCAL).triple()[0]
        kind='מלא' if mag>=1 and big else ('טבעתי' if mag>=1 or (not big and mag>0.95) else 'חלקי')
        solar.append(f'{bce(y)}\t{fmt(t)}\t{dow(ephem.julian_date(t))}\t{mag:.2f}\t{kind}\t{alt:.0f}')
    # lunar
    best=None; vis=False
    for k in range(-180,181,2):
        t=fm+k/1440; moon.compute(t); sun.compute(t)
        # anti-solar point
        anti=ephem.Equatorial(sun.ra+math.pi, -sun.dec, epoch=t)
        a=ephem.FixedBody(); a._ra=anti.ra; a._dec=anti.dec; a._epoch=t; a.compute(t)
        sep=ephem.separation(moon,a)
        hp=math.asin(ephem.earth_radius/(moon.earth_distance*ephem.meters_per_au))
        ps=math.asin(ephem.earth_radius/(sun.earth_distance*ephem.meters_per_au))
        umb=1.02*(hp+ps-sun.radius); pen=1.02*(hp+ps+sun.radius)
        umag=(umb+moon.radius-sep)/(2*moon.radius)
        if umag>0:
            o=obs(t); moon.compute(o)
            if moon.alt>0: vis=True
            if best is None or umag>best[1]: best=(t,umag)
    if best and vis:
        t,m=best; y=ephem.Date(t+LOCAL).triple()[0]
        lunar.append(f'{bce(y)}\t{fmt(t)}\t{dow(ephem.julian_date(t))}\t{m:.2f}\t{"מלא" if m>=1 else "חלקי"}')
    d=ephem.Date(max(nm,fm)+1)
open(f'{OUT}/solar_eclipses_jerusalem.tsv','w').write('שנה\tשיא_הליקוי_זמן_מקומי\tיום_בשבוע\tגודל(חלק_מקוטר_השמש)\tסוג_בירושלים\tגובה_השמש_מעלות\n'+'\n'.join(solar)+'\n')
open(f'{OUT}/lunar_eclipses_jerusalem.tsv','w').write('שנה\tשיא_הליקוי_זמן_מקומי\tיום_בשבוע\tגודל_צל_ליבה\tסוג\n'+'\n'.join(lunar)+'\n')
print(len(solar),'solar',len(lunar),'lunar')
