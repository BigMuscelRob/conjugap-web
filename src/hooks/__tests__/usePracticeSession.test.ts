import { renderHook, act } from '@testing-library/react';
import { usePracticeSession } from '../usePracticeSession';
import { usePracticeRetry } from '../usePracticeRetry';
import type { QueueItem } from '../usePracticeRetry';

jest.mock('../usePracticeRetry');
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

const mockRetryHook = usePracticeRetry as jest.Mock;

function makeItem(form: string): QueueItem {
  return {
    key:           'hablar|pres|yo',
    conjugationId: 1,
    verbId:        1,
    infinitive:    'hablar',
    cls:           '-ar',
    meaningDe:     'sprechen',
    tense:         'pres',
    pronoun:       'yo',
    form,
  };
}

function setupMock(overrides: Record<string, unknown> = {}) {
  const advance = jest.fn();
  mockRetryHook.mockReturnValue({
    current:          makeItem('hablo'),
    loading:          false,
    error:            null,
    done:             false,
    totalItems:       5,
    masteredN:        2,
    firstTryCorrectN: 1,
    progressPct:      40,
    retryCount:       0,
    blocksCompleted:  0,
    totalBlocks:      1,
    blockTransition:  null,
    startedAtRef:     { current: 0 },
    advance,
    loadNextBlock:    jest.fn(),
    ...overrides,
  });
  return advance;
}

const CONFIG = { verbs: ['hablar'], tenses: ['pres'], mode: 'random' as const, length: null };

describe('usePracticeSession', () => {
  it('recognizes a correct answer', () => {
    setupMock();
    const { result } = renderHook(() => usePracticeSession(CONFIG));

    let outcome: string | undefined;
    act(() => { outcome = result.current.checkAnswer('hablo'); });

    expect(outcome).toBe('correct');
    expect(result.current.answerState).toBe('correct');
  });

  it('recognizes a wrong answer', () => {
    setupMock();
    const { result } = renderHook(() => usePracticeSession(CONFIG));

    let outcome: string | undefined;
    act(() => { outcome = result.current.checkAnswer('hablas'); });

    expect(outcome).toBe('wrong');
    expect(result.current.answerState).toBe('wrong');
  });

  it('ignores accents when comparing answers', () => {
    setupMock({ current: makeItem('está') });
    const { result } = renderHook(() => usePracticeSession(CONFIG));

    let outcome: string | undefined;
    act(() => { outcome = result.current.checkAnswer('esta'); });

    expect(outcome).toBe('correct');
  });

  it('nextQuestion advances with the current answer state and resets to idle', () => {
    const advance = setupMock();
    const { result } = renderHook(() => usePracticeSession(CONFIG));

    act(() => { result.current.checkAnswer('hablo'); });
    expect(result.current.answerState).toBe('correct');

    act(() => { result.current.nextQuestion(); });

    expect(advance).toHaveBeenCalledWith('correct');
    expect(result.current.answerState).toBe('idle');
  });
});
