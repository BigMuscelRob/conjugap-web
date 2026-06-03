export const metadata = { title: 'Datenschutz – ConjuGap' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-[32px] tracking-tightest text-ink-900 mb-8">
        Datenschutzerklärung
      </h1>

      <section className="flex flex-col gap-8 text-[15px] text-ink-700 leading-relaxed">

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">1. Verantwortlicher</h2>
          <p>
            Robin Harsch, c/o IP-Management #10458, Ludwig-Erhard-Straße 18,
            20459 Hamburg<br />
            E-Mail:{' '}
            <a href="mailto:info.conjugap@proton.me"
              className="text-terracotta-500 hover:underline">
              info.conjugap@proton.me
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">2. Welche Daten wir erheben</h2>
          <p>
            Bei der Registrierung via Google OAuth erhalten wir von Google
            folgende Daten: Name, E-Mail-Adresse und Profilbild-URL.
            Diese Daten werden in unserer Datenbank gespeichert und
            ausschließlich zur Bereitstellung der App-Funktionen
            (Accountverwaltung, Lernfortschritt, Streak) verwendet.
          </p>
          <p className="mt-2">
            Darüber hinaus speichern wir nutzungsbezogene Daten:
            Übungsergebnisse, Trefferquoten, Streak-Zähler und
            Sitzungsdauern. Diese Daten dienen ausschließlich der
            personalisierten Lernauswertung innerhalb der App.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">3. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b
            DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse am Betrieb der Lernplattform).
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">4. Google OAuth</h2>
          <p>
            Zur Anmeldung nutzen wir Google OAuth 2.0 (Google Ireland Limited,
            Gordon House, Barrow Street, Dublin 4, Irland). Dabei werden
            ausschließlich Profildaten (Name, E-Mail, Profilbild) übertragen.
            Wir fordern keinen Zugriff auf weitere Google-Dienste
            (z. B. Gmail, Drive). Informationen zur Datenverarbeitung durch
            Google findest du unter:{' '}
            <a href="https://policies.google.com/privacy"
              target="_blank" rel="noopener noreferrer"
              className="text-terracotta-500 hover:underline">
              https://policies.google.com/privacy
            </a>.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">5. Speicherdauer</h2>
          <p>
            Deine Daten werden gespeichert solange du einen Account bei
            ConjuGap besitzt. Du kannst deinen Account und alle
            zugehörigen Daten jederzeit unter{' '}
            <a href="/profile" className="text-terracotta-500 hover:underline">
              Kontoeinstellungen → Account löschen
            </a>{' '}
            vollständig und unwiderruflich löschen.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">6. Deine Rechte</h2>
          <p>Du hast das Recht auf:</p>
          <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-2">
            Für Anfragen wende dich an:{' '}
            <a href="mailto:info.conjugap@proton.me"
              className="text-terracotta-500 hover:underline">
              info.conjugap@proton.me
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">7. Beschwerderecht</h2>
          <p>
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde
            zu beschweren. Die zuständige Behörde in Hamburg ist der
            Hamburgische Beauftragte für Datenschutz und Informationsfreiheit
            (HmbBfDI), Ludwig-Erhard-Straße 22, 20459 Hamburg.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-[18px] text-ink-900 mb-2">8. Cookies</h2>
          <p>
            ConjuGap verwendet ausschließlich technisch notwendige Cookies
            für die Session-Verwaltung (Login-Status) und die
            Spracheinstellung. Es werden keine Tracking- oder
            Werbe-Cookies eingesetzt. Eine Einwilligung ist daher
            nicht erforderlich.
          </p>
        </div>

        <p className="text-[13px] text-ink-400 mt-4">
          Stand: Juni 2026
        </p>

      </section>
    </div>
  );
}
