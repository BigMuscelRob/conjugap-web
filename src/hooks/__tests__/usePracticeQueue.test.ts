import { renderHook, waitFor } from '@testing-library/react';
import { usePracticeQueue } from '../usePracticeQueue';

const PRONOUN_ORDER = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];

function makeVerb(id: number, infinitive: string, cls = '-ar') {
  return { id, infinitive, cls, irregular: false, meaningDe: 'test', meaningEn: 'test' };
}

function makeFullVerb(id: number, infinitive: string, cls = '-ar', tenses = ['pres']) {
  return {
    id, infinitive, cls, irregular: false, meaningDe: 'test', meaningEn: 'test',
    conjugations: tenses.flatMap((tense, ti) =>
      PRONOUN_ORDER.map((pronoun, pi) => ({
        id: id * 1000 + ti * 10 + pi,
        verbId: id,
        tense,
        pronoun,
        form: `${infinitive}_${tense}_${pi}`,
      }))
    ),
  };
}

function setupFetch(
  verbs: ReturnType<typeof makeVerb>[],
  fulls: ReturnType<typeof makeFullVerb>[],
) {
  global.fetch = jest.fn((url: string) => {
    if (url === '/api/verbs') {
      return Promise.resolve({ json: () => Promise.resolve(verbs) } as Response);
    }
    const m = /\/api\/verbs\/(\d+)\/conjugations/.exec(url);
    if (m) {
      return Promise.resolve({
        json: () => Promise.resolve(fulls.find(v => v.id === +m[1])),
      } as Response);
    }
    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  }) as jest.Mock;
}

beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => jest.resetAllMocks());
afterAll(() => jest.restoreAllMocks());

const BASE = { verbs: ['hablar'], tenses: ['pres'], mode: 'structured' as const, length: null };

describe('usePracticeQueue', () => {
  it('queue contains all selected verbs × tenses × 6 persons', async () => {
    setupFetch([makeVerb(1, 'hablar')], [makeFullVerb(1, 'hablar')]);

    const { result } = renderHook(() => usePracticeQueue(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.totalItems).toBe(6);
    expect(result.current.firstBlock).toHaveLength(6);
  });

  it('only selected verbs appear in the queue', async () => {
    setupFetch(
      [makeVerb(1, 'hablar'), makeVerb(2, 'comer', '-er')],
      [makeFullVerb(1, 'hablar'), makeFullVerb(2, 'comer', '-er')],
    );

    const { result } = renderHook(() => usePracticeQueue({ ...BASE, verbs: ['hablar'] }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.firstBlock.every(i => i.infinitive === 'hablar')).toBe(true);
    expect(result.current.totalItems).toBe(6);
  });

  it('totalItems equals verbs × tenses × 6 persons', async () => {
    setupFetch(
      [makeVerb(1, 'hablar'), makeVerb(2, 'comer', '-er')],
      [
        makeFullVerb(1, 'hablar', '-ar', ['pres', 'pi']),
        makeFullVerb(2, 'comer',  '-er', ['pres', 'pi']),
      ],
    );

    const { result } = renderHook(() =>
      usePracticeQueue({ ...BASE, verbs: ['hablar', 'comer'], tenses: ['pres', 'pi'] }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalItems).toBe(24); // 2 verbs × 2 tenses × 6 pronouns
  });

  it('random mode: all items present and no pending blocks', async () => {
    setupFetch(
      [makeVerb(1, 'hablar'), makeVerb(2, 'comer', '-er')],
      [makeFullVerb(1, 'hablar'), makeFullVerb(2, 'comer', '-er')],
    );

    const { result } = renderHook(() =>
      usePracticeQueue({ ...BASE, verbs: ['hablar', 'comer'], mode: 'random' }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.firstBlock).toHaveLength(12);
    expect(result.current.pendingBlocks).toHaveLength(0);
    expect(result.current.firstBlock.filter(i => i.infinitive === 'hablar')).toHaveLength(6);
    expect(result.current.firstBlock.filter(i => i.infinitive === 'comer')).toHaveLength(6);
  });

  it('structured mode: first block is first verb in pronoun order, second block follows', async () => {
    setupFetch(
      [makeVerb(1, 'hablar'), makeVerb(2, 'comer', '-er')],
      [makeFullVerb(1, 'hablar'), makeFullVerb(2, 'comer', '-er')],
    );

    const { result } = renderHook(() =>
      usePracticeQueue({ ...BASE, verbs: ['hablar', 'comer'] }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    const first = result.current.firstBlock;
    expect(first.every(i => i.infinitive === 'hablar' && i.tense === 'pres')).toBe(true);
    expect(first.map(i => i.pronoun)).toEqual(PRONOUN_ORDER);

    expect(result.current.pendingBlocks).toHaveLength(1);
    expect(result.current.pendingBlocks[0].every(i => i.infinitive === 'comer')).toBe(true);
  });
});
