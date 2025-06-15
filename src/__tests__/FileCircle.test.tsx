/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { FileCircle, type FileCircleHandle } from '../client/components/FileCircle';
import Matter from 'matter-js';

jest.mock('matter-js', () => ({
  __esModule: true,
  default: {
    Bodies: { circle: jest.fn(() => ({ angle: 0, position: { x: 0, y: 0 } })) },
    Body: { scale: jest.fn() },
    Composite: { add: jest.fn(), remove: jest.fn() },
  },
}));

const mockMatter = Matter as unknown as {
  Bodies: { circle: jest.Mock };
  Body: { scale: jest.Mock };
  Composite: { add: jest.Mock; remove: jest.Mock };
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('FileCircle', () => {
  it('forwards methods and updates radius', () => {
    const engine = { world: {} } as unknown as Matter.Engine;
    const ref = React.createRef<FileCircleHandle>();

    const { container, unmount } = render(
      <FileCircle
        file="a/b.txt"
        lines={10}
        initialRadius={10}
        engine={engine}
        width={100}
        height={100}
        ref={ref}
      />,
    );

    expect(mockMatter.Bodies.circle).toHaveBeenCalled();
    expect(mockMatter.Composite.add).toHaveBeenCalledWith(engine.world, expect.any(Object));

    const circle = container.querySelector('.file-circle') as HTMLDivElement;
    expect(circle.style.width).toBe('20px');

    act(() => {
      ref.current?.setCount(5);
      ref.current?.showGlow('glow', 100);
      ref.current?.updateRadius(15);
    });

    expect(circle.querySelector('.count')?.textContent).toBe('5');
    expect(circle.classList.contains('glow')).toBe(true);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(circle.classList.contains('glow')).toBe(false);
    expect(mockMatter.Body.scale).toHaveBeenCalledWith(expect.any(Object), 1.5, 1.5);
    expect(circle.style.width).toBe('30px');

    unmount();
    expect(mockMatter.Composite.remove).toHaveBeenCalledWith(engine.world, expect.any(Object));
  });
});
