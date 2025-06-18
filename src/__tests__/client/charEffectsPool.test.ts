/** @jest-environment jsdom */
import { createCharEffectsPool } from '../../client/charEffectsPool';
import { MAX_EFFECT_CHARS } from '../../client/constants';

describe('createCharEffectsPool', () => {
  it('creates isolated span pools', () => {
    const poolA = createCharEffectsPool();
    const poolB = createCharEffectsPool();

    const spanA = poolA.acquireSpan();
    expect(poolA.availableSpans()).toBe(MAX_EFFECT_CHARS - 1);
    expect(poolB.availableSpans()).toBe(MAX_EFFECT_CHARS);

    if (spanA) {
      poolA.releaseSpan(spanA);
    }

    expect(poolA.availableSpans()).toBe(MAX_EFFECT_CHARS);
  });
});
