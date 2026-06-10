import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

const PRONOUNS   = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'] as const;
const TENSE_KEYS = ['pres', 'pi', 'imp', 'pp', 'fut', 'cond', 'sub', 'imper'] as const;
type TenseKey = typeof TENSE_KEYS[number];

type VerbSeed = {
  infinitive: string;
  cls: string;
  irregular: boolean;
  meaningDe: string;
  meaningEn: string;
  tenses: Record<TenseKey, [string, string, string, string, string, string]>;
};

const NEW_VERBS: VerbSeed[] = [
  {
    infinitive: 'mandar',
    cls: '-ar',
    irregular: false,
    meaningDe: 'schicken / senden',
    meaningEn: 'to send / to order',
    tenses: {
      pres:  ['mando',      'mandas',      'manda',      'mandamos',     'mandáis',       'mandan'],
      pi:    ['mandé',      'mandaste',    'mandó',      'mandamos',     'mandasteis',    'mandaron'],
      imp:   ['mandaba',    'mandabas',    'mandaba',    'mandábamos',   'mandabais',     'mandaban'],
      pp:    ['he mandado', 'has mandado', 'ha mandado', 'hemos mandado','habéis mandado','han mandado'],
      fut:   ['mandaré',    'mandarás',    'mandará',    'mandaremos',   'mandaréis',     'mandarán'],
      cond:  ['mandaría',   'mandarías',   'mandaría',   'mandaríamos',  'mandaríais',    'mandarían'],
      sub:   ['mande',      'mandes',      'mande',      'mandemos',     'mandéis',       'manden'],
      imper: ['—',          'manda',       'mande',      'mandemos',     'mandad',        'manden'],
    },
  },
  {
    infinitive: 'meter',
    cls: '-er',
    irregular: false,
    meaningDe: 'hineinstecken / einlegen',
    meaningEn: 'to put in / to insert',
    tenses: {
      pres:  ['meto',      'metes',      'mete',      'metemos',     'metéis',       'meten'],
      pi:    ['metí',      'metiste',    'metió',     'metimos',     'metisteis',    'metieron'],
      imp:   ['metía',     'metías',     'metía',     'metíamos',    'metíais',      'metían'],
      pp:    ['he metido', 'has metido', 'ha metido', 'hemos metido','habéis metido','han metido'],
      fut:   ['meteré',    'meterás',    'meterá',    'meteremos',   'meteréis',     'meterán'],
      cond:  ['metería',   'meterías',   'metería',   'meteríamos',  'meteríais',    'meterían'],
      sub:   ['meta',      'metas',      'meta',      'metamos',     'metáis',       'metan'],
      imper: ['—',         'mete',       'meta',      'metamos',     'meted',        'metan'],
    },
  },
];

async function main() {
  for (const verbData of NEW_VERBS) {
    const { tenses, ...verbFields } = verbData;

    const verb = await prisma.verb.upsert({
      where:  { infinitive: verbData.infinitive },
      update: {},
      create: verbFields,
    });

    for (const tenseKey of TENSE_KEYS) {
      for (let i = 0; i < PRONOUNS.length; i++) {
        await prisma.conjugation.upsert({
          where:  { verbId_tense_pronoun: { verbId: verb.id, tense: tenseKey, pronoun: PRONOUNS[i] } },
          update: { form: tenses[tenseKey][i] },
          create: { verbId: verb.id, tense: tenseKey, pronoun: PRONOUNS[i], form: tenses[tenseKey][i] },
        });
      }
    }
    console.log(`  ✓ ${verbData.infinitive}`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
