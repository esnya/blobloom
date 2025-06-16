/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../../client/App';
import { setupAppTest } from '../helpers/app';

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App duration control', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest({ commits });
  });

  afterEach(() => {
    restore();
    jest.clearAllMocks();
  });

  it('recreates player with new duration', async () => {
    const factory = jest.fn(() => ({
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      togglePlay: jest.fn(),
      isPlaying: jest.fn(() => false),
    }));

    const { container } = render(<App playerFactory={factory} />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());

    const input = container.querySelector('#duration') as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: '10' } });

    await waitFor(() => {
      const last = factory.mock.calls[factory.mock.calls.length - 1]! as unknown[];
      expect(last[0]).toEqual(expect.objectContaining({ duration: 10 }));
    });
  });
});
