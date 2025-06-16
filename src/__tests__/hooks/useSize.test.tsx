/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { useSize } from '../../client/hooks/useSize';

describe('useSize', () => {
  it('updates size on resize', () => {
    function Component() {
      const { ref, size } = useSize<HTMLDivElement>();
      return (
        // eslint-disable-next-line no-restricted-syntax
        <div ref={ref} data-width={size.width} data-height={size.height}></div>
      );
    }
    const { container } = render(<Component />);
    const div = container.firstChild as HTMLDivElement;

    Object.defineProperty(div, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 100, height: 50, top: 0, left: 0, bottom: 0, right: 0 }),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(div.dataset.width).toBe('100');
    expect(div.dataset.height).toBe('50');

    Object.defineProperty(div, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 150, height: 75, top: 0, left: 0, bottom: 0, right: 0 }),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(div.dataset.width).toBe('150');
    expect(div.dataset.height).toBe('75');
  });
});
