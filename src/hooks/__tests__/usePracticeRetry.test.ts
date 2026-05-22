import { renderHook, waitFor, act } from '@testing-library/react';
import { usePracticeRetry } from '../usePracticeRetry';
import { usePracticeQueue } from '../usePracticeQueue';
import type { QueueItem } from '../usePracticeQueue';

jest.mock('../usePracticeQueue');

const mockQueue = usePracticeQueue as jest.Mock;

function makeItem(infinitive: string): QueueItem {
  return {
    key:           `${infinitive}|pres|yo`,
    conjugationId: 1,
    verbId:        1,
    infinitive,
    cls:           '-ar',
    meaningDe:     'test',
    tense:         'pres',
    pronoun:       'yo',
    form:          `${infinitive}_form`,
  };
}

function setupMock(items: QueueItem[]) {
  mockQueue.mockReturnValue({
    loading:       false,
    error:         null,
    firstBlock:    items,
    pendingBlocks: [],
    totalItems:    items.length,
    totalBlocks:   0,
    startedAtRef:  { current: 0 },
  });
}

const CONFIG = { verbs: ['hablar'], tenses: ['pres'], mode: 'random' as const, length: null };

beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
afterEach(() => jest.restoreAllMocks());

describe('usePracticeRetry', () => {
  it('wrong answer reinserts question behind upcoming items', async () => {
    const items = [makeItem('hablar'), makeItem('comer'), makeItem('beber')];
    setupMock(items);

    const { result } = renderHook(() => usePracticeRetry(CONFIG));
    await waitFor(() => expect(result.current.current?.infinitive).toBe('hablar'));

    act(() => result.current.advance('wrong'));

    // Math.random=0 → delay=3, at=min(3,2)=2 → [comer, beber, hablar]
    expect(result.current.current?.infinitive).toBe('comer');
    expect(result.current.masteredN).toBe(0);
    expect(result.current.retryCount).toBe(1);
  });

  it('correct answer removes question from queue and increments masteredN', async () => {
    const items = [makeItem('hablar'), makeItem('comer')];
    setupMock(items);

    const { result } = renderHook(() => usePracticeRetry(CONFIG));
    await waitFor(() => expect(result.current.current?.infinitive).toBe('hablar'));

    act(() => result.current.advance('correct'));

    expect(result.current.masteredN).toBe(1);
    expect(result.current.current?.infinitive).toBe('comer');
  });

  it('session is done only when all items are correctly answered', async () => {
    const items = [makeItem('hablar'), makeItem('comer')];
    setupMock(items);

    const { result } = renderHook(() => usePracticeRetry(CONFIG));
    await waitFor(() => expect(result.current.current).not.toBeNull());

    expect(result.current.done).toBe(false);

    act(() => result.current.advance('correct'));
    expect(result.current.done).toBe(false);

    act(() => result.current.advance('correct'));
    expect(result.current.done).toBe(true);
  });
});
