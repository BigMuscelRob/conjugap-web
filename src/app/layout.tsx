import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import AuthSessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'ConjuGap — Spanisch konjugieren, endlich kein Stress mehr',
  description:
    'Trainiere spanische Verbkonjugation mit gezieltem Feedback und kurzen, motivierenden Übungseinheiten.',
  keywords: ['Spanisch', 'Konjugation', 'Lernen', 'Verben', 'Trainer'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400;12..96,75..100,500;12..96,75..100,600;12..96,75..100,700&family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
        />
        {/* Phosphor Icons */}
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-ink-900 font-body antialiased">
        <AuthSessionProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
