import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ── Config ────────────────────────────────────────────────────────────────────

const ANKI_FILE         = path.join(__dirname, 'anki-source.txt');
const TRANSLATIONS_FILE = path.join(__dirname, 'verb-translations.json');

const TENSE_MAP: Record<string, string> = {
  presente:            'pres',
  imperfecto:          'imp',
  indefinido:          'pi',
  futuro:              'fut',
  condicional:         'cond',
  subjuntivo_presente: 'sub',
  imperativo:          'imper',
};

const CLASS_MAP: Record<string, string> = {
  ends_in_ar:  '-ar',
  ends_in_er:  '-er',
  ends_in_ir:  '-ir',
  'ends_in_ír': '-ir',
};

// Priority order for pronoun detection
const PRONOUN_PRIORITY = ['yo','tú','él_ella_usted','nosotros','vosotros','ellos_ellas_ustedes','tú_vos'];
const PRONOUN_MAP: Record<string, string> = {
  yo:                  'yo',
  tú:                  'tú',
  tú_vos:              'tú',        // imperativo tú-form
  él_ella_usted:       'él/ella',
  nosotros:            'nosotros',
  vosotros:            'vosotros',
  ellos_ellas_ustedes: 'ellos/ellas',
};

const SKIP_TAGS = new Set([
  'orientation','participio','gerundio','infinitivo','negative_imperativo',
  'subjuntivo_pasado','subjuntivo_futuro',
]);

const NON_VERB_TAGS = new Set([
  'ends_in_ar','ends_in_er','ends_in_ir','ends_in_ír',
  'irregular_verb','regular_verb','irregular_form','regular_form',
  'extreme_irregularity','high_irregularity','moderate_irregularity','low_irregularity',
  'regular_spelling_change','in_the_wild','dicho','refrán','refran','idiom','orientation',
  'presente','imperfecto','indefinido','futuro','condicional',
  'subjuntivo_presente','subjuntivo_pasado','subjuntivo_futuro',
  'imperativo','negative_imperativo','participio','gerundio','infinitivo',
  'yo','tú','él_ella_usted','nosotros','vosotros','ellos_ellas_ustedes','vos','tú_vos',
  'cita','note','modismo','impersonal','pronominal','disonante','in_the_wild',
]);

// ── Parser ────────────────────────────────────────────────────────────────────

function decodeHtmlEntities(s: string): string {
  return s.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

type ConjugationRecord = {
  infinitive: string;
  cls:        string;
  irregular:  boolean;
  tense:      string;
  pronoun:    string;
  form:       string;
};

function parseAnkiFile(filePath: string, allowedVerbs: Set<string>): ConjugationRecord[] {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const results: ConjugationRecord[] = [];

  let pendingForm: string | null = null;

  for (const line of lines) {
    // Front field: contains both data-cloze (the answer) and cloze_pronoun
    if (line.includes('data-cloze=') && line.includes('cloze_pronoun')) {
      // data-cloze uses doubled quotes in the export: data-cloze=""soy""
      const m = line.match(/data-cloze=""([^"]+)""/);
      if (m) {
        const form = decodeHtmlEntities(m[1].trim());
        // Orientation cards have very long data-cloze values (encoded sentences)
        if (form.length < 50) {
          pendingForm = form;
        }
      }
    }

    // Tags line is in the back field, a few lines after the front
    if (pendingForm !== null && line.includes("tags: <span class='tags'>")) {
      const m = line.match(/<span class='tags'>([^<]+)<\/span>/);
      if (m) {
        const tags = m[1].trim().split(/\s+/);

        // Skip unwanted card types
        if (tags.some(t => SKIP_TAGS.has(t))) { pendingForm = null; continue; }

        // Skip vos-pronoun cards (the standalone 'vos' pronoun tag)
        if (tags.includes('vos')) { pendingForm = null; continue; }

        // Find tense
        const tenseTag = tags.find(t => TENSE_MAP[t]);
        if (!tenseTag) { pendingForm = null; continue; }
        const tense = TENSE_MAP[tenseTag];

        // Find pronoun (priority order)
        let pronoun: string | null = null;
        for (const tag of PRONOUN_PRIORITY) {
          if (tags.includes(tag)) { pronoun = PRONOUN_MAP[tag]; break; }
        }
        if (!pronoun) { pendingForm = null; continue; }

        // Find verb class
        const clsTag = tags.find(t => CLASS_MAP[t]);
        const cls    = clsTag ? CLASS_MAP[clsTag] : '-ar';

        const irregular = tags.includes('irregular_verb');

        // Infinitive: a Spanish-word tag that isn't metadata
        const infinitive = tags.find(t => !NON_VERB_TAGS.has(t) && /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+$/.test(t));
        if (!infinitive || !allowedVerbs.has(infinitive)) { pendingForm = null; continue; }

        results.push({ infinitive, cls, irregular, tense, pronoun, form: pendingForm });
      }
      pendingForm = null;
    }
  }

  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const translations: Record<string, { meaningDe: string; meaningEn: string }> =
    JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf-8'));

  const allowedVerbs = new Set(Object.keys(translations));

  console.log(`Parsing Anki file for ${allowedVerbs.size} verbs…`);
  const records = parseAnkiFile(ANKI_FILE, allowedVerbs);
  console.log(`Found ${records.length} conjugation records`);

  // Group by infinitive
  const verbMap = new Map<string, { cls: string; irregular: boolean; conjugations: typeof records }>();
  for (const r of records) {
    if (!verbMap.has(r.infinitive)) {
      verbMap.set(r.infinitive, { cls: r.cls, irregular: r.irregular, conjugations: [] });
    }
    verbMap.get(r.infinitive)!.conjugations.push(r);
  }

  console.log(`Found ${verbMap.size} unique verbs\n`);

  let verbCount = 0;
  let conjCount = 0;

  for (const [infinitive, data] of verbMap) {
    const translation = translations[infinitive]!;

    const verb = await prisma.verb.upsert({
      where:  { infinitive },
      create: { infinitive, cls: data.cls, irregular: data.irregular, meaningDe: translation.meaningDe, meaningEn: translation.meaningEn },
      update: { cls: data.cls, irregular: data.irregular, meaningDe: translation.meaningDe, meaningEn: translation.meaningEn },
    });

    verbCount++;

    // Deduplicate: same tense+pronoun → keep last occurrence
    const conjMap = new Map<string, string>();
    for (const c of data.conjugations) conjMap.set(`${c.tense}|${c.pronoun}`, c.form);

    for (const [key, form] of conjMap) {
      const [tense, pronoun] = key.split('|');
      await prisma.conjugation.upsert({
        where:  { verbId_tense_pronoun: { verbId: verb.id, tense, pronoun } },
        create: { verbId: verb.id, tense, pronoun, form },
        update: { form },
      });
      conjCount++;
    }
  }

  console.log(`✓ Upserted ${verbCount} verbs, ${conjCount} conjugations`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
