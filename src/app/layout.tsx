import type { Metadata, Viewport } from 'next';
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';

const heebo = Heebo({ subsets: ['hebrew', 'latin'], variable: '--font-heebo', display: 'swap' });
const frank = Frank_Ruhl_Libre({
    subsets: ['hebrew', 'latin'],
    weight: ['400', '500', '700'],
    variable: '--font-frank',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'כוונה: התכווננות יומית',
    description: 'שלושה רגעים ביום, שבעה נרות בשבוע. התכווננות אישית במינימום זמן.',
    manifest: '/manifest.json',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'כוונה' },
    icons: { icon: '/icons/icon-192x192.png', apple: '/icons/icon-192x192.png' },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#E8E2D2' },
        { media: '(prefers-color-scheme: dark)', color: '#2A2520' },
    ],
};

// Applies night mode before first paint, so the evening never flashes bright.
const themeBootstrap = `try{var m=localStorage.getItem('kavana_theme_mode')||'auto',h=new Date().getHours();if(m==='dark'||(m==='auto'&&(h>=18||h<6)))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="he" dir="rtl" suppressHydrationWarning className={`${heebo.variable} ${frank.variable}`}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
            </head>
            <body className="antialiased">
                <AuthProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </AuthProvider>
                <Toaster position="top-center" dir="rtl" />
            </body>
        </html>
    );
}
