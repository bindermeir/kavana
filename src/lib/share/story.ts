/**
 * Draws the 9:16 story card for "the line of the day" on a canvas.
 * Drawn in the browser (not on the server) so Hebrew shaping and RTL
 * come out exactly right with the app's own fonts.
 */
export type StoryVariant = 'day' | 'night' | 'shabbat';

export interface StoryInput {
    line: string;
    reference?: string;
    kicker: string; // e.g. "יום חמישי · כ״ה בחשון"
    litThrough: number; // 0..6
    levels: number[]; // 0..3 per day
    variant: StoryVariant;
    site: string;
}

const W = 1080;
const H = 1920;

const PALETTE: Record<StoryVariant, { bg: string; fg: string; soft: string; line: string; metal: string; cup: string }> = {
    day: { bg: '#E8E2D2', fg: '#5C403C', soft: '#7A7865', line: '#7A7865', metal: '#5C403C', cup: '#5C403C' },
    night: { bg: '#2A2520', fg: '#EDE6D6', soft: '#B5AC9C', line: '#8A8170', metal: '#CFC6B4', cup: '#4A4038' },
    shabbat: { bg: '#F2EDE0', fg: '#5C403C', soft: '#7A7865', line: '#A08A5C', metal: '#5C403C', cup: '#5C403C' },
};

function fontFamily(varName: string, fallback: string): string {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v || fallback;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const out: string[] = [];
    for (const para of text.split('\n')) {
        let line = '';
        for (const word of para.split(/\s+/).filter(Boolean)) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                out.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) out.push(line);
    }
    return out;
}

function drawMenorah(ctx: CanvasRenderingContext2D, cx: number, top: number, scale: number, input: StoryInput, pal: (typeof PALETTE)[StoryVariant]) {
    ctx.save();
    ctx.translate(cx - 60 * scale, top);
    ctx.scale(scale, scale);
    ctx.strokeStyle = pal.metal;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // The branches of the Arch of Titus, no base
    const body = ['M15,26 A45,45 0 0 0 105,26', 'M30,26 A30,30 0 0 0 90,26', 'M45,26 A15,15 0 0 0 75,26', 'M60,26 L60,71'];
    ctx.lineWidth = 1.5;
    body.forEach((d) => ctx.stroke(new Path2D(d)));

    const xs = [105, 90, 75, 60, 45, 30, 15];
    xs.forEach((x, day) => {
        const lit = day <= input.litThrough;
        const level = Math.max(0, Math.min(3, input.levels[day] || 0));

        if (lit && (day === 3 || level === 3)) {
            const r = day === 3 ? 12 : 9;
            const halo = ctx.createRadialGradient(x, 15, 0, x, 15, r);
            halo.addColorStop(0, 'rgba(242,184,102,0.45)');
            halo.addColorStop(1, 'rgba(242,184,102,0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(x, 15, r, 0, Math.PI * 2);
            ctx.fill();
        }
        if (lit) {
            const s = 0.7 + level * 0.14;
            ctx.save();
            ctx.translate(x, 23);
            ctx.scale(s, s);
            const g = ctx.createRadialGradient(0, -5, 0, 0, -6, 12);
            g.addColorStop(0, '#FFF3D6');
            g.addColorStop(0.5, '#F0A84E');
            g.addColorStop(1, 'rgba(224,137,46,0.12)');
            ctx.fillStyle = g;
            ctx.fill(new Path2D('M0,-17 C4.5,-10 5,-4 0,0 C-5,-4 -4.5,-10 0,-17 Z'));
            ctx.restore();
        }
        ctx.globalAlpha = lit ? 1 : 0.45;
        ctx.lineWidth = 1.2;
        ctx.stroke(new Path2D(`M${x - 5},24 Q${x},29 ${x + 5},24`));
        ctx.globalAlpha = 1;
    });
    ctx.restore();
}

export async function drawStory(input: StoryInput): Promise<Blob> {
    const pal = PALETTE[input.variant];
    const serif = fontFamily('--font-frank', 'serif');
    const sans = fontFamily('--font-heebo', 'sans-serif');
    try {
        await Promise.all([document.fonts.load(`700 80px ${serif}`), document.fonts.load(`400 34px ${sans}`)]);
    } catch {
        // fall back to whatever is loaded
    }

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.direction = 'rtl';

    // parchment
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = input.variant === 'night' ? 'rgba(255,240,210,0.018)' : 'rgba(92,64,60,0.03)';
    for (let i = 0; i < H; i += 4) ctx.fillRect(0, i, W, 2);
    for (let i = 0; i < W; i += 4) ctx.fillRect(i, 0, 2, H);

    // double frame
    ctx.strokeStyle = pal.line;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 60, W - 120, H - 120, 32);
    ctx.stroke();
    roundRect(ctx, 74, 74, W - 148, H - 148, 24);
    ctx.stroke();
    ctx.globalAlpha = 1;

    drawMenorah(ctx, W / 2, 230, 3.8, input, pal);

    ctx.textAlign = 'center';
    ctx.fillStyle = pal.soft;
    ctx.font = `400 36px ${sans}`;
    ctx.fillText(input.kicker, W / 2, 620);

    // the line, as large as it can comfortably be
    ctx.fillStyle = pal.fg;
    let size = 84;
    let lines: string[] = [];
    for (; size >= 52; size -= 4) {
        ctx.font = `700 ${size}px ${serif}`;
        lines = wrap(ctx, input.line, 820);
        if (lines.length * size * 1.45 <= 700) break;
    }
    const lineH = size * 1.45;
    const blockH = lines.length * lineH;
    const centerY = 1130;
    let y = centerY - blockH / 2 + size * 0.95;

    ctx.fillStyle = pal.line;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(W / 2 - 45, centerY - blockH / 2 - 70, 90, 3);
    ctx.fillRect(W / 2 - 45, centerY + blockH / 2 + 50, 90, 3);
    ctx.globalAlpha = 1;

    ctx.fillStyle = pal.fg;
    ctx.font = `700 ${size}px ${serif}`;
    for (const l of lines) {
        ctx.fillText(l, W / 2, y);
        y += lineH;
    }

    if (input.reference) {
        ctx.fillStyle = pal.soft;
        ctx.font = `400 34px ${sans}`;
        ctx.fillText(input.reference, W / 2, centerY + blockH / 2 + 125);
    }

    ctx.fillStyle = pal.fg;
    ctx.font = `700 58px ${serif}`;
    ctx.fillText('כוונה', W / 2, H - 230);
    ctx.fillStyle = pal.soft;
    ctx.font = `400 28px ${sans}`;
    ctx.direction = 'ltr';
    ctx.fillText(input.site, W / 2, H - 180);

    return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}
