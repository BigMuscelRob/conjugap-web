'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UserData {
  name:  string | null;
  email: string | null;
  image: string | null;
}

export default function ProfilClient() {
  const router = useRouter();
  const t = useTranslations('profil');
  const [user,    setUser]    = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(async res => {
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const initial = user ? (user.name ?? user.email ?? '?')[0].toUpperCase() : '?';

  return (
    <div className="bg-cream min-h-screen px-6 py-12">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        <h1 className="font-display font-bold text-[28px] text-ink-900 leading-tight">{t('title')}</h1>

        <div className="bg-cream border-2 border-ink-900 rounded-2xl shadow-stamp overflow-hidden">

          {/* Avatar + name row */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-ink-900/10">
            {loading ? (
              <div className="w-14 h-14 rounded-full bg-ink-100 animate-pulse shrink-0" />
            ) : (
              <div className="relative w-14 h-14 rounded-full bg-saffron-100 border-2 border-ink-900/20 overflow-hidden flex items-center justify-center shrink-0">
                <span className="font-bold text-[22px] text-saffron-700 select-none">{initial}</span>
                {user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? ''}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
            )}
            <div>
              {loading
                ? <div className="h-5 w-32 bg-ink-100 rounded animate-pulse mb-1" />
                : <p className="font-bold text-[16px] text-ink-900">{user?.name ?? '—'}</p>
              }
              {loading
                ? <div className="h-4 w-44 bg-ink-100 rounded animate-pulse" />
                : <p className="text-[13px] font-semibold text-ink-500">{user?.email ?? '—'}</p>
              }
            </div>
          </div>

          {/* Variante del español */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-900/10">
            <div>
              <p className="font-bold text-[14px] text-ink-900">{t('variant_label')}</p>
              <p className="text-[12px] font-semibold text-ink-500 mt-0.5">{t('variant_sub')}</p>
            </div>
            <select
              defaultValue="es-es"
              className="px-3 py-2 rounded-[10px] border-2 border-ink-900/12 bg-cream font-bold text-[13px] text-ink-900 cursor-pointer focus:outline-none focus:border-terracotta-400 transition-colors"
            >
              <option value="es-es">{t('variant_es')}</option>
              <option value="es-mx">{t('variant_mx')}</option>
              <option value="es-ar">{t('variant_ar')}</option>
            </select>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-900/10">
            <div>
              <p className="font-bold text-[14px] text-ink-900">{t('email_label')}</p>
              <p className="text-[13px] font-semibold text-ink-500 mt-0.5">
                {loading ? '…' : (user?.email ?? '—')}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="font-bold text-[14px] text-terracotta-500 hover:text-terracotta-600
                transition-colors duration-micro"
            >
              {t('signout')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
