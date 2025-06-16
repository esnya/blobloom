/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useCharEffects } from '../../client/hooks/useCharEffects';

describe('useCharEffects', () => {
  it('spawns and removes characters', () => {
    const { result } = renderHook(() => useCharEffects());
    const onEnd = jest.fn();

    act(() => {
      result.current.spawnChar('add', { x: 0, y: 0 }, onEnd);
    });
    expect(result.current.chars).toHaveLength(1);

    const id = result.current.chars[0]!.id;
    act(() => {
      result.current.removeChar(id);
    });

    expect(result.current.chars).toHaveLength(0);
  });
});
