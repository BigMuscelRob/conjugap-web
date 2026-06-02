export type TenseHint = {
  example: {
    verb:        string;
    conjugation: Record<string, string>;
  };
};

export const TENSE_HINTS: Record<string, TenseHint> = {
  pres:  { example: { verb: 'hablar', conjugation: { 'yo': 'hablo',    'tú': 'hablas',    'él/ella': 'habla',    'nosotros': 'hablamos',   'vosotros': 'habláis',    'ellos/ellas': 'hablan'    } } },
  pi:    { example: { verb: 'hablar', conjugation: { 'yo': 'hablé',    'tú': 'hablaste',  'él/ella': 'habló',    'nosotros': 'hablamos',   'vosotros': 'hablasteis', 'ellos/ellas': 'hablaron'  } } },
  imp:   { example: { verb: 'hablar', conjugation: { 'yo': 'hablaba',  'tú': 'hablabas',  'él/ella': 'hablaba',  'nosotros': 'hablábamos', 'vosotros': 'hablabais',  'ellos/ellas': 'hablaban'  } } },
  pp:    { example: { verb: 'hablar', conjugation: { 'yo': 'he hablado',    'tú': 'has hablado',    'él/ella': 'ha hablado',    'nosotros': 'hemos hablado',   'vosotros': 'habéis hablado', 'ellos/ellas': 'han hablado'    } } },
  fut:   { example: { verb: 'hablar', conjugation: { 'yo': 'hablaré',  'tú': 'hablarás',  'él/ella': 'hablará',  'nosotros': 'hablaremos', 'vosotros': 'hablaréis',  'ellos/ellas': 'hablarán'  } } },
  cond:  { example: { verb: 'hablar', conjugation: { 'yo': 'hablaría', 'tú': 'hablarías', 'él/ella': 'hablaría', 'nosotros': 'hablaríamos','vosotros': 'hablaríais', 'ellos/ellas': 'hablarían' } } },
  sub:   { example: { verb: 'hablar', conjugation: { 'yo': 'hable',    'tú': 'hables',    'él/ella': 'hable',    'nosotros': 'hablemos',   'vosotros': 'habléis',    'ellos/ellas': 'hablen'    } } },
  imper: { example: { verb: 'hablar', conjugation: { 'yo': '—',        'tú': 'habla',     'él/ella': 'hable',    'nosotros': 'hablemos',   'vosotros': 'hablad',     'ellos/ellas': 'hablen'    } } },
};
