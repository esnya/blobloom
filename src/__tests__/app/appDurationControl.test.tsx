/** @jest-environment jsdom */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { App } from '../../client/App';
import * as playerHook from '../../client/hooks/usePlayer';
const { createPlayer } = playerHook;
import { setupAppTest } from '../helpers/app';

let createPlayerSpy: jest.SpiedFunction<typeof playerHook.createPlayer>;

const commits = [
  { id: 'n', message: 'new', timestamp: 2 },
  { id: 'o', message: 'old', timestamp: 1 },
];

describe('App duration control', () => {
  let restore: () => void;

  beforeEach(() => {
    jest.resetModules();
    restore = setupAppTest({ commits });
    createPlayerSpy = jest
      .spyOn(playerHook, 'createPlayer')
      .mockReturnValue({
        stop: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        togglePlay: jest.fn(),
        isPlaying: jest.fn(() => false),
      });
  });

  afterEach(() => {
    restore();
    jest.restoreAllMocks();
  });

  it('recreates player with new duration', async () => {
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector('#commit-log')).toBeTruthy());

    const input = container.querySelector('#duration') as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: '10' } });

    await waitFor(() => {
      const last = createPlayerSpy.mock.calls[createPlayerSpy.mock.calls.length - 1] as unknown as [
        Record<string, unknown>,
      ];
      expect(last[0]).toEqual(expect.objectContaining({ duration: 10 }));
    });
  });
});
