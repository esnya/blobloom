/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import { FileCircleSimulation } from '../client/components/FileCircleSimulation';
import type { LineCount } from '../client/types';

describe('FileCircleSimulation', () => {
  it('renders circles for files', () => {
    const data: LineCount[] = [
      { file: 'a', lines: 10, added: 0, removed: 0 },
      { file: 'b', lines: 20, added: 0, removed: 0 },
    ];
    const { container } = render(<FileCircleSimulation data={data} />);
    const div = container.firstChild as HTMLDivElement;

    Object.defineProperty(div, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 100, height: 100, top: 0, left: 0, bottom: 0, right: 0 }),
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(container.querySelectorAll('.file-circle').length).toBe(2);
  });
});
