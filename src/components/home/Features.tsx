const FEATURES = [
  {
    step: '01',
    icon: 'target',
    bg: 'bg-terracotta-500',
    title: 'Pick your battle.',
    body: 'Wähle einen Tempus und eine Verbklasse. Wir zeigen die Verben, mit denen du wirklich kämpfst — keine zufälligen Übungen.',
  },
  {
    step: '02',
    icon: 'keyboard',
    bg: 'bg-saffron-500',
    title: 'Tipp die Form.',
    body: 'Kein Multiple Choice. Echtes Tippen baut echtes Muskelgedächtnis auf. Drücke ⏎ zum Prüfen.',
  },
  {
    step: '03',
    icon: 'flame',
    bg: 'bg-sage-300',
    title: 'Bau den Streak auf.',
    body: 'Fünf Minuten heute. Dann morgen. Verbito erinnert sich, was du vergessen hast, und bringt es zurück.',
  },
];

export default function Features() {
  return (
    <section className="bg-cream py-20 px-6">
      <div className="max-w-content mx-auto">

        <p className="text-overline tracking-wide-10 uppercase font-bold text-ink-500 text-center mb-3">
          How it works
        </p>
        <h2 className="font-display font-bold text-40 leading-[44px] tracking-tight-2 text-center text-ink-900 mb-14">
          Drei Dinge. Das ist das Geheimnis.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.step}
              className="bg-paper border-2 border-ink-900 rounded-lg p-8 shadow-stamp-big flex flex-col gap-4"
            >
              <span className="font-mono text-[11px] font-bold text-ink-500">{f.step}</span>
              <div className={`w-14 h-14 rounded-md border-2 border-ink-900 inline-flex items-center justify-center text-white-warm text-3xl ${f.bg}`}>
                <i className={`ph-bold ph-${f.icon}`} aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-22 leading-7 tracking-tight-1 text-ink-900">
                {f.title}
              </h3>
              <p className="text-[15px] leading-6 text-ink-700">{f.body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
