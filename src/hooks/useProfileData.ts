'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ProfileData } from '@/types/profile';

export function useProfileData() {
  const { status } = useSession();
  const router     = useRouter();
  const [data,    setData]    = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status !== 'authenticated')   return;
    fetch('/api/profile')
      .then(r => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then(d => { if (d) setData(d); })
      .catch(() => setError('Fehler beim Laden'))
      .finally(() => setLoading(false));
  }, [status]);

  return { data, loading, error };
}
