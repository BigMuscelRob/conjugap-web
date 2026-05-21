import { signIn } from '@/../auth';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-paper border-2 border-ink-900 rounded-[24px] p-10
        shadow-stamp-big max-w-[400px] w-full flex flex-col items-center gap-6 text-center">

        <div className="w-16 h-16 rounded-full bg-saffron-50 border-2 border-saffron-200
          flex items-center justify-center">
          <i className="ph-bold ph-user text-[28px] text-saffron-600" />
        </div>

        <div>
          <h1 className="font-bricolage font-bold text-[28px] text-brand-dark leading-tight">
            Anmelden
          </h1>
          <p className="text-sm font-semibold text-brand-muted mt-2">
            Speichere deinen Fortschritt und Streak.
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/practice' });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3
              font-body font-bold text-[16px] text-ink-900
              px-6 py-3.5 bg-white border-2 border-ink-900 rounded-md
              shadow-stamp-primary transition-all duration-micro ease-smooth
              hover:-translate-y-px hover:shadow-stamp-primary-hover
              active:translate-y-0.5 active:shadow-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google anmelden
          </button>
        </form>

        <p className="text-[11px] font-semibold text-brand-muted leading-snug">
          Mit der Anmeldung stimmst du unseren Nutzungsbedingungen zu.
        </p>
      </div>
    </main>
  );
}
