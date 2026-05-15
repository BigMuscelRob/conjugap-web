import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tiempos — Verbito',
  description: 'Alle Spanischen Tempi im Überblick.',
};

const TENSES = [
  { name: 'Presente',                  desc: 'Gegenwart — was gerade passiert oder immer gilt.',       dotClass: 'bg-terracotta-500', btnClass: 'text-terracotta-500' },
  { name: 'Pretérito Indefinido',      desc: 'Vergangenheit — abgeschlossene Handlungen.',              dotClass: 'bg-saffron-500',    btnClass: 'text-saffron-600'   },
  { name: 'Pretérito Imperfecto',      desc: 'Beschreibende Vergangenheit — Zustände und Gewohnheiten.', dotClass: 'bg-sage-300',       btnClass: 'text-sage-500'      },
  { name: 'Futuro Simple',             desc: 'Zukunft — Pläne und Vorhersagen.',                        dotClass: 'bg-ink-300',        btnClass: 'text-ink-700'       },
  { name: 'Condicional Simple',        desc: 'Konjunktiv II — was wäre wenn.',                          dotClass: 'bg-berry-500',      btnClass: 'text-berry-500'     },
  { name: 'Presente de Subjuntivo',    desc: 'Subjuntivo Präsens — Wünsche und Zweifel.',               dotClass: 'bg-terracotta-700', btnClass: 'text-terracotta-700'},
];

export default function TensesPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-20">

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-5 mb-14">
        <p className="text-overline tracking-wide-10 uppercase font-bold text-ink-500">
          Tiempos verbales
        </p>
        <h1 className="font-display font-bold text-h1 leading-[60px] tracking-tight-2 text-ink-900">
          Die Tempi im Überblick
        </h1>
        <p className="text-bodyL text-ink-500 max-w-[480px]">
          Wähle einen Tempus, um gezielt zu üben. Verbito führt dich durch alle
          Formen — Schritt für Schritt.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TENSES.map((t) => (
          <div
            key={t.name}
            className="bg-paper border-2 border-ink-900 rounded-lg p-8 shadow-stamp-big flex flex-col gap-4
              transition-all duration-base ease-smooth
              hover:-translate-y-0.5 hover:shadow-stamp-big-hover"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${t.dotClass}`} />
            <h2 className="font-display font-bold text-h3 leading-[30px] tracking-tight-1 text-ink-900">
              {t.name}
            </h2>
            <p className="text-small text-ink-700 flex-1">{t.desc}</p>
            <button
              type="button"
              className={`inline-flex items-center gap-1 font-body font-bold text-small
                bg-transparent border-none cursor-pointer mt-auto p-0
                transition-gap duration-micro ease-smooth ${t.btnClass}`}
            >
              Üben <i className="ph-bold ph-arrow-right" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
