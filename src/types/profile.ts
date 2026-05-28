export interface ProfileData {
  user: {
    name:             string | null;
    email:            string | null;
    image:            string | null;
    currentStreak:    number;
    longestStreak:    number;
    lastPracticeDate: string | null;
    createdAt:        string;
  };
  stats: {
    totalCorrect:          number;
    totalIncorrect:        number;
    totalAnswered:         number;
    overallAccuracy:       number;
    avgSecondsPerQuestion: number;
  };
  tenseBreakdown: Array<{
    tense:    string;
    correct:  number;
    incorrect:number;
    accuracy: number;
  }>;
  weakSpots: Array<{
    verbInfinitive: string;
    pronoun:        string;
    tense:          string;
    correct:        number;
    incorrect:      number;
    accuracy:       number;
  }>;
  heatmap: Array<{
    date:         string;
    sessionCount: number;
    totalMinutes: number;
  }>;
  weeklyMinutes: Array<{
    dayIndex: number;
    minutes:  number;
  }>;
}
