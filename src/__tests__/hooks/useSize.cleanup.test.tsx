/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { useSize } from '../../client/hooks/useSize';

describe('useSize cleanup', () => {
  it('removes resize listener on unmount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    function Component() {
      const { ref } = useSize<HTMLDivElement>();
      return (
        // eslint-disable-next-line no-restricted-syntax
        <div ref={ref}></div>
      );
    }

    const { unmount } = render(<Component />);
    const handler = addSpy.mock.calls.find(c => c[0] === 'resize')?.[1] as EventListener;

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', handler);
  });

  it('handles missing bounding rect', () => {
    function Component() {
      const { ref, size } = useSize<HTMLDivElement>();
      return (
        // eslint-disable-next-line no-restricted-syntax
        <div ref={ref} data-w={size.width} data-h={size.height}></div>
      );
    }
    const { container } = render(<Component />);
    const div = container.firstChild as HTMLDivElement;
    Object.defineProperty(div, 'getBoundingClientRect', { value: () => undefined });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(div.dataset.w).toBe('0');
    expect(div.dataset.h).toBe('0');
  });
});
