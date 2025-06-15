/** @jest-environment jsdom */
import React from 'react';
import { render, act } from '@testing-library/react';
import {
  FileCircleContent,
  type FileCircleContentHandle,
} from '../client/components/FileCircleContent';

describe('FileCircleContent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('exposes DOM and effects', () => {
    const container = document.createElement('div');
    const ref = React.createRef<FileCircleContentHandle>();
    const { getByText } = render(
      <FileCircleContent
        path="src/"
        name="index.ts"
        count={1}
        container={{ current: container }}
        ref={ref}
      />,
    );

    expect(ref.current?.charsEl).toBeInstanceOf(HTMLDivElement);
    expect(getByText('1')).toBeTruthy();

    act(() => {
      ref.current?.setCount(5);
      ref.current?.showGlow('glow', 200);
    });

    expect(getByText('5')).toBeTruthy();
    expect(container.classList.contains('glow')).toBe(true);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(container.classList.contains('glow')).toBe(false);
  });
});
