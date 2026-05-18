import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

const PRONOUNS = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'] as const;
const TENSE_KEYS = ['pres', 'pi', 'imp', 'pp', 'fut', 'cond', 'sub', 'imper'] as const;
type TenseKey = typeof TENSE_KEYS[number];

type VerbSeed = {
  infinitive: string;
  cls: string;
  irregular: boolean;
  meaningDe: string;
  meaningEn: string;
  // each tense: [yo, tú, él/ella, nosotros, vosotros, ellos/ellas]
  tenses: Record<TenseKey, [string, string, string, string, string, string]>;
};

// — = no form exists for this person/tense
const VERBS: VerbSeed[] = [
  {
    infinitive: 'hablar',
    cls: '-ar',
    irregular: false,
    meaningDe: 'sprechen',
    meaningEn: 'to speak',
    tenses: {
      pres:  ['hablo',     'hablas',     'habla',     'hablamos',    'habláis',    'hablan'],
      pi:    ['hablé',     'hablaste',   'habló',     'hablamos',    'hablasteis', 'hablaron'],
      imp:   ['hablaba',   'hablabas',   'hablaba',   'hablábamos',  'hablabais',  'hablaban'],
      pp:    ['he hablado','has hablado','ha hablado','hemos hablado','habéis hablado','han hablado'],
      fut:   ['hablaré',   'hablarás',   'hablará',   'hablaremos',  'hablaréis',  'hablarán'],
      cond:  ['hablaría',  'hablarías',  'hablaría',  'hablaríamos', 'hablaríais', 'hablarían'],
      sub:   ['hable',     'hables',     'hable',     'hablemos',    'habléis',    'hablen'],
      imper: ['—',         'habla',      'hable',     'hablemos',    'hablad',     'hablen'],
    },
  },
  {
    infinitive: 'comer',
    cls: '-er',
    irregular: false,
    meaningDe: 'essen',
    meaningEn: 'to eat',
    tenses: {
      pres:  ['como',     'comes',     'come',     'comemos',    'coméis',    'comen'],
      pi:    ['comí',     'comiste',   'comió',    'comimos',    'comisteis', 'comieron'],
      imp:   ['comía',    'comías',    'comía',    'comíamos',   'comíais',   'comían'],
      pp:    ['he comido','has comido','ha comido','hemos comido','habéis comido','han comido'],
      fut:   ['comeré',   'comerás',   'comerá',   'comeremos',  'comeréis',  'comerán'],
      cond:  ['comería',  'comerías',  'comería',  'comeríamos', 'comeríais', 'comerían'],
      sub:   ['coma',     'comas',     'coma',     'comamos',    'comáis',    'coman'],
      imper: ['—',        'come',      'coma',     'comamos',    'comed',     'coman'],
    },
  },
  {
    infinitive: 'vivir',
    cls: '-ir',
    irregular: false,
    meaningDe: 'leben',
    meaningEn: 'to live',
    tenses: {
      pres:  ['vivo',     'vives',     'vive',     'vivimos',    'vivís',     'viven'],
      pi:    ['viví',     'viviste',   'vivió',    'vivimos',    'vivisteis', 'vivieron'],
      imp:   ['vivía',    'vivías',    'vivía',    'vivíamos',   'vivíais',   'vivían'],
      pp:    ['he vivido','has vivido','ha vivido','hemos vivido','habéis vivido','han vivido'],
      fut:   ['viviré',   'vivirás',   'vivirá',   'viviremos',  'viviréis',  'vivirán'],
      cond:  ['viviría',  'vivirías',  'viviría',  'viviríamos', 'viviríais', 'vivirían'],
      sub:   ['viva',     'vivas',     'viva',     'vivamos',    'viváis',    'vivan'],
      imper: ['—',        'vive',      'viva',     'vivamos',    'vivid',     'vivan'],
    },
  },
  {
    infinitive: 'tener',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'haben',
    meaningEn: 'to have',
    tenses: {
      pres:  ['tengo',     'tienes',     'tiene',     'tenemos',    'tenéis',    'tienen'],
      pi:    ['tuve',      'tuviste',    'tuvo',      'tuvimos',    'tuvisteis', 'tuvieron'],
      imp:   ['tenía',     'tenías',     'tenía',     'teníamos',   'teníais',   'tenían'],
      pp:    ['he tenido', 'has tenido', 'ha tenido', 'hemos tenido','habéis tenido','han tenido'],
      fut:   ['tendré',    'tendrás',    'tendrá',    'tendremos',  'tendréis',  'tendrán'],
      cond:  ['tendría',   'tendrías',   'tendría',   'tendríamos', 'tendríais', 'tendrían'],
      sub:   ['tenga',     'tengas',     'tenga',     'tengamos',   'tengáis',   'tengan'],
      imper: ['—',         'ten',        'tenga',     'tengamos',   'tened',     'tengan'],
    },
  },
  {
    infinitive: 'ir',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'gehen / fahren',
    meaningEn: 'to go',
    tenses: {
      pres:  ['voy',   'vas',    'va',    'vamos',   'vais',    'van'],
      pi:    ['fui',   'fuiste', 'fue',   'fuimos',  'fuisteis','fueron'],
      imp:   ['iba',   'ibas',   'iba',   'íbamos',  'ibais',   'iban'],
      pp:    ['he ido','has ido','ha ido','hemos ido','habéis ido','han ido'],
      fut:   ['iré',   'irás',   'irá',   'iremos',  'iréis',   'irán'],
      cond:  ['iría',  'irías',  'iría',  'iríamos', 'iríais',  'irían'],
      sub:   ['vaya',  'vayas',  'vaya',  'vayamos', 'vayáis',  'vayan'],
      imper: ['—',     've',     'vaya',  'vayamos', 'id',      'vayan'],
    },
  },
  {
    infinitive: 'ser',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'sein (dauerhaft)',
    meaningEn: 'to be (permanent)',
    tenses: {
      pres:  ['soy',    'eres',    'es',    'somos',    'sois',    'son'],
      pi:    ['fui',    'fuiste',  'fue',   'fuimos',   'fuisteis','fueron'],
      imp:   ['era',    'eras',    'era',   'éramos',   'erais',   'eran'],
      pp:    ['he sido','has sido','ha sido','hemos sido','habéis sido','han sido'],
      fut:   ['seré',   'serás',   'será',  'seremos',  'seréis',  'serán'],
      cond:  ['sería',  'serías',  'sería', 'seríamos', 'seríais', 'serían'],
      sub:   ['sea',    'seas',    'sea',   'seamos',   'seáis',   'sean'],
      imper: ['—',      'sé',      'sea',   'seamos',   'sed',     'sean'],
    },
  },
  {
    infinitive: 'estar',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'sein (vorübergehend)',
    meaningEn: 'to be (temporary)',
    tenses: {
      pres:  ['estoy',      'estás',      'está',      'estamos',     'estáis',      'están'],
      pi:    ['estuve',     'estuviste',  'estuvo',    'estuvimos',   'estuvisteis', 'estuvieron'],
      imp:   ['estaba',     'estabas',    'estaba',    'estábamos',   'estabais',    'estaban'],
      pp:    ['he estado',  'has estado', 'ha estado', 'hemos estado','habéis estado','han estado'],
      fut:   ['estaré',     'estarás',    'estará',    'estaremos',   'estaréis',    'estarán'],
      cond:  ['estaría',    'estarías',   'estaría',   'estaríamos',  'estaríais',   'estarían'],
      sub:   ['esté',       'estés',      'esté',      'estemos',     'estéis',      'estén'],
      imper: ['—',          'está',       'esté',      'estemos',     'estad',       'estén'],
    },
  },
  {
    infinitive: 'querer',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'wollen / lieben',
    meaningEn: 'to want / to love',
    tenses: {
      pres:  ['quiero',      'quieres',     'quiere',     'queremos',    'queréis',    'quieren'],
      pi:    ['quise',       'quisiste',    'quiso',      'quisimos',    'quisisteis', 'quisieron'],
      imp:   ['quería',      'querías',     'quería',     'queríamos',   'queríais',   'querían'],
      pp:    ['he querido',  'has querido', 'ha querido', 'hemos querido','habéis querido','han querido'],
      fut:   ['querré',      'querrás',     'querrá',     'querremos',   'querréis',   'querrán'],
      cond:  ['querría',     'querrías',    'querría',    'querríamos',  'querríais',  'querrían'],
      sub:   ['quiera',      'quieras',     'quiera',     'queramos',    'queráis',    'quieran'],
      imper: ['—',           'quiere',      'quiera',     'queramos',    'quered',     'quieran'],
    },
  },
  {
    infinitive: 'estudiar',
    cls: '-ar',
    irregular: false,
    meaningDe: 'studieren / lernen',
    meaningEn: 'to study',
    tenses: {
      pres:  ['estudio',       'estudias',       'estudia',       'estudiamos',      'estudiáis',      'estudian'],
      pi:    ['estudié',       'estudiaste',     'estudió',       'estudiamos',      'estudiasteis',   'estudiaron'],
      imp:   ['estudiaba',     'estudiabas',     'estudiaba',     'estudiábamos',    'estudiabais',    'estudiaban'],
      pp:    ['he estudiado',  'has estudiado',  'ha estudiado',  'hemos estudiado', 'habéis estudiado','han estudiado'],
      fut:   ['estudiaré',     'estudiarás',     'estudiará',     'estudiaremos',    'estudiaréis',    'estudiarán'],
      cond:  ['estudiaría',    'estudiarías',    'estudiaría',    'estudiaríamos',   'estudiaríais',   'estudiarían'],
      sub:   ['estudie',       'estudies',       'estudie',       'estudiemos',      'estudiéis',      'estudien'],
      imper: ['—',             'estudia',        'estudie',       'estudiemos',      'estudiad',       'estudien'],
    },
  },
  {
    infinitive: 'trabajar',
    cls: '-ar',
    irregular: false,
    meaningDe: 'arbeiten',
    meaningEn: 'to work',
    tenses: {
      pres:  ['trabajo',       'trabajas',       'trabaja',       'trabajamos',      'trabajáis',      'trabajan'],
      pi:    ['trabajé',       'trabajaste',     'trabajó',       'trabajamos',      'trabajasteis',   'trabajaron'],
      imp:   ['trabajaba',     'trabajabas',     'trabajaba',     'trabajábamos',    'trabajabais',    'trabajaban'],
      pp:    ['he trabajado',  'has trabajado',  'ha trabajado',  'hemos trabajado', 'habéis trabajado','han trabajado'],
      fut:   ['trabajaré',     'trabajarás',     'trabajará',     'trabajaremos',    'trabajaréis',    'trabajarán'],
      cond:  ['trabajaría',    'trabajarías',    'trabajaría',    'trabajaríamos',   'trabajaríais',   'trabajarían'],
      sub:   ['trabaje',       'trabajes',       'trabaje',       'trabajemos',      'trabajéis',      'trabajen'],
      imper: ['—',             'trabaja',        'trabaje',       'trabajemos',      'trabajad',       'trabajen'],
    },
  },
  {
    infinitive: 'beber',
    cls: '-er',
    irregular: false,
    meaningDe: 'trinken',
    meaningEn: 'to drink',
    tenses: {
      pres:  ['bebo',     'bebes',     'bebe',     'bebemos',    'bebéis',    'beben'],
      pi:    ['bebí',     'bebiste',   'bebió',    'bebimos',    'bebisteis', 'bebieron'],
      imp:   ['bebía',    'bebías',    'bebía',    'bebíamos',   'bebíais',   'bebían'],
      pp:    ['he bebido','has bebido','ha bebido','hemos bebido','habéis bebido','han bebido'],
      fut:   ['beberé',   'beberás',   'beberá',   'beberemos',  'beberéis',  'beberán'],
      cond:  ['bebería',  'beberías',  'bebería',  'beberíamos', 'beberíais', 'beberían'],
      sub:   ['beba',     'bebas',     'beba',     'bebamos',    'bebáis',    'beban'],
      imper: ['—',        'bebe',      'beba',     'bebamos',    'bebed',     'beban'],
    },
  },
  {
    infinitive: 'leer',
    cls: '-er',
    irregular: true,
    meaningDe: 'lesen',
    meaningEn: 'to read',
    tenses: {
      pres:  ['leo',     'lees',     'lee',     'leemos',    'leéis',    'leen'],
      pi:    ['leí',     'leíste',   'leyó',    'leímos',    'leísteis', 'leyeron'],
      imp:   ['leía',    'leías',    'leía',    'leíamos',   'leíais',   'leían'],
      pp:    ['he leído','has leído','ha leído','hemos leído','habéis leído','han leído'],
      fut:   ['leeré',   'leerás',   'leerá',   'leeremos',  'leeréis',  'leerán'],
      cond:  ['leería',  'leerías',  'leería',  'leeríamos', 'leeríais', 'leerían'],
      sub:   ['lea',     'leas',     'lea',     'leamos',    'leáis',    'lean'],
      imper: ['—',       'lee',      'lea',     'leamos',    'leed',     'lean'],
    },
  },
  {
    infinitive: 'escribir',
    cls: '-ir',
    irregular: true,
    meaningDe: 'schreiben',
    meaningEn: 'to write',
    tenses: {
      pres:  ['escribo',       'escribes',       'escribe',       'escribimos',      'escribís',       'escriben'],
      pi:    ['escribí',       'escribiste',     'escribió',      'escribimos',      'escribisteis',   'escribieron'],
      imp:   ['escribía',      'escribías',      'escribía',      'escribíamos',     'escribíais',     'escribían'],
      pp:    ['he escrito',    'has escrito',    'ha escrito',    'hemos escrito',   'habéis escrito', 'han escrito'],
      fut:   ['escribiré',     'escribirás',     'escribirá',     'escribiremos',    'escribiréis',    'escribirán'],
      cond:  ['escribiría',    'escribirías',    'escribiría',    'escribiríamos',   'escribiríais',   'escribirían'],
      sub:   ['escriba',       'escribas',       'escriba',       'escribamos',      'escribáis',      'escriban'],
      imper: ['—',             'escribe',        'escriba',       'escribamos',      'escribid',       'escriban'],
    },
  },
  {
    infinitive: 'salir',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'ausgehen / herausgehen',
    meaningEn: 'to go out / to leave',
    tenses: {
      pres:  ['salgo',     'sales',     'sale',     'salimos',    'salís',     'salen'],
      pi:    ['salí',      'saliste',   'salió',    'salimos',    'salisteis', 'salieron'],
      imp:   ['salía',     'salías',    'salía',    'salíamos',   'salíais',   'salían'],
      pp:    ['he salido', 'has salido','ha salido','hemos salido','habéis salido','han salido'],
      fut:   ['saldré',    'saldrás',   'saldrá',   'saldremos',  'saldréis',  'saldrán'],
      cond:  ['saldría',   'saldrías',  'saldría',  'saldríamos', 'saldríais', 'saldrían'],
      sub:   ['salga',     'salgas',    'salga',    'salgamos',   'salgáis',   'salgan'],
      imper: ['—',         'sal',       'salga',    'salgamos',   'salid',     'salgan'],
    },
  },
  {
    infinitive: 'venir',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'kommen',
    meaningEn: 'to come',
    tenses: {
      pres:  ['vengo',     'vienes',     'viene',     'venimos',    'venís',     'vienen'],
      pi:    ['vine',      'viniste',    'vino',      'vinimos',    'vinisteis', 'vinieron'],
      imp:   ['venía',     'venías',     'venía',     'veníamos',   'veníais',   'venían'],
      pp:    ['he venido', 'has venido', 'ha venido', 'hemos venido','habéis venido','han venido'],
      fut:   ['vendré',    'vendrás',    'vendrá',    'vendremos',  'vendréis',  'vendrán'],
      cond:  ['vendría',   'vendrías',   'vendría',   'vendríamos', 'vendríais', 'vendrían'],
      sub:   ['venga',     'vengas',     'venga',     'vengamos',   'vengáis',   'vengan'],
      imper: ['—',         'ven',        'venga',     'vengamos',   'venid',     'vengan'],
    },
  },
  {
    infinitive: 'hacer',
    cls: 'irregulares',
    irregular: true,
    meaningDe: 'machen / tun',
    meaningEn: 'to make / to do',
    tenses: {
      pres:  ['hago',     'haces',     'hace',     'hacemos',    'hacéis',    'hacen'],
      pi:    ['hice',     'hiciste',   'hizo',     'hicimos',    'hicisteis', 'hicieron'],
      imp:   ['hacía',    'hacías',    'hacía',    'hacíamos',   'hacíais',   'hacían'],
      pp:    ['he hecho', 'has hecho', 'ha hecho', 'hemos hecho','habéis hecho','han hecho'],
      fut:   ['haré',     'harás',     'hará',     'haremos',    'haréis',    'harán'],
      cond:  ['haría',    'harías',    'haría',    'haríamos',   'haríais',   'harían'],
      sub:   ['haga',     'hagas',     'haga',     'hagamos',    'hagáis',    'hagan'],
      imper: ['—',        'haz',       'haga',     'hagamos',    'haced',     'hagan'],
    },
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.conjugation.deleteMany();
  await prisma.verb.deleteMany();

  for (const verbData of VERBS) {
    const { tenses, ...verbFields } = verbData;

    const conjugationRows = TENSE_KEYS.flatMap(tenseKey =>
      PRONOUNS.map((pronoun, i) => ({
        tense:   tenseKey,
        pronoun,
        form:    tenses[tenseKey][i],
      }))
    );

    await prisma.verb.create({
      data: {
        ...verbFields,
        conjugations: { create: conjugationRows },
      },
    });

    console.log(`  ✓ ${verbData.infinitive}`);
  }

  console.log(`\nDone. Seeded ${VERBS.length} verbs, ${VERBS.length * TENSE_KEYS.length * PRONOUNS.length} conjugations.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
