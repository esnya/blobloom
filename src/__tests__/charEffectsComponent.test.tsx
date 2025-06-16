/** @jest-environment jsdom */
// eslint-disable-next-line no-restricted-syntax
import React, { forwardRef, useImperativeHandle } from 'react';
import { render, act } from '@testing-library/react';
import { CharEffects } from '../client/components/CharEffects';
import { useCharEffects } from '../client/hooks/useCharEffects';

jest.useFakeTimers();

type Ref = { spawn: () => void };

// eslint-disable-next-line no-restricted-syntax
const Wrapper = forwardRef((_, ref: React.Ref<Ref>) => {
  const effects = useCharEffects();
  useImperativeHandle(ref, () => ({
    spawn: () => effects.spawnChar('add-char', { x: 0, y: 0 }, () => {}),
  }));
  return <CharEffects effects={effects} />;
});

Wrapper.displayName = 'Wrapper';

describe('CharEffects component', () => {
  it('spawns characters', () => {
    // eslint-disable-next-line no-restricted-syntax
    const ref = React.createRef<Ref>();
    // eslint-disable-next-line no-restricted-syntax
    const { container } = render(<Wrapper ref={ref} />);
    act(() => {
      ref.current!.spawn();
    });
    expect(container.querySelectorAll('.add-char').length).toBe(1);
    expect(container.querySelector('.add-char')).toBeTruthy();
  });

  it('removes characters after animation', () => {
    // eslint-disable-next-line no-restricted-syntax
    const ref = React.createRef<Ref>();
    // eslint-disable-next-line no-restricted-syntax
    const { container } = render(<Wrapper ref={ref} />);
    act(() => {
      ref.current!.spawn();
    });
    act(() => {
      jest.advanceTimersByTime(2600);
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelector('.add-char')).toBeNull();
  });
});
