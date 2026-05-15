export type VerbClass = '-ar' | '-er' | '-ir';

export type TenseName =
  | 'Presente'
  | 'Pretérito Indefinido'
  | 'Pretérito Imperfecto'
  | 'Futuro Simple'
  | 'Condicional Simple'
  | 'Presente de Subjuntivo';

export type Pronoun = 'yo' | 'tú' | 'él/ella' | 'nosotros' | 'vosotros' | 'ellos/ellas';

export interface Conjugation {
  yo: string;
  tú: string;
  'él/ella': string;
  nosotros: string;
  vosotros: string;
  'ellos/ellas': string;
}

export interface Verb {
  infinitive: string;
  translation: string;
  verbClass: VerbClass;
  conjugations: Partial<Record<TenseName, Conjugation>>;
}

export interface PracticeSession {
  verbId: string;
  tense: TenseName;
  pronoun: Pronoun;
}

export interface SessionResult {
  correct: number;
  total: number;
  xp: number;
}
