export const metadata = { title: 'Impressum – ConjuGap' };

export default function ImprintPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-[32px] tracking-tightest text-ink-900 mb-8">
        Impressum
      </h1>

      <section className="flex flex-col gap-6 text-[15px] text-ink-700 leading-relaxed">

        <div>
          <h2 className="font-bold text-ink-900 mb-1">Angaben gemäß § 5 DDG</h2>
          <p>Robin Harsch</p>
          <p>c/o IP-Management #10458</p>
          <p>Ludwig-Erhard-Straße 18</p>
          <p>20459 Hamburg</p>
        </div>

        <div>
          <h2 className="font-bold text-ink-900 mb-1">Kontakt</h2>
          <p>E-Mail: <a href="mailto:info.conjugap@proton.me"
            className="text-terracotta-500 hover:underline">
            info.conjugap@proton.me
          </a></p>
        </div>

        <div>
          <h2 className="font-bold text-ink-900 mb-1">Verantwortlich für den Inhalt</h2>
          <p>Robin Harsch (Anschrift wie oben)</p>
        </div>

        <div>
          <h2 className="font-bold text-ink-900 mb-1">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr"
              target="_blank" rel="noopener noreferrer"
              className="text-terracotta-500 hover:underline">
              https://ec.europa.eu/consumers/odr
            </a>.
            Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

      </section>
    </div>
  );
}
