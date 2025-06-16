/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../../client/App';
import { createPlayer } from '../../client/player';
import { setupAppTest } from '../helpers/app';

jest.mock('../../client/player');

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App duration control', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest({ commits });
    (createPlayer as jest.Mock).mockReturnValue({
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      togglePlay: jest.fn(),
      isPlaying: jest.fn(() => false),
    });
  });

  afterEach(() => {
    restore();
    jest.clearAllMocks();
  });

  it('recreates player with new duration', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());

    const input = container.querySelector('#duration') as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: '10' } });

    await waitFor(() => {
      const mock = createPlayer as jest.MockedFunction<typeof createPlayer>;
      const last = mock.mock.calls[mock.mock.calls.length - 1] as unknown as [
        Record<string, unknown>,
      ];
      expect(last[0]).toEqual(expect.objectContaining({ duration: 10 }));
    });
  });
});
