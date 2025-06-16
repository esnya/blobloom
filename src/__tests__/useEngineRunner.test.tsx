/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { useEngineRunner } from '../client/hooks/useEngineRunner';
import * as engineHook from '../client/hooks/useEngine';
import { Engine } from '../client/physics';

describe('useEngineRunner', () => {
  it('starts engine on mount and stops on unmount', () => {
    const engine = new Engine();
    jest.spyOn(engine, 'start').mockImplementation(() => undefined);
    jest.spyOn(engine, 'stop').mockImplementation(() => undefined);
    jest.spyOn(engineHook, 'useEngine').mockReturnValue(engine);

    const Runner = () => {
      useEngineRunner();
      return null;
    };

    const { unmount } = render(<Runner />);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.start).toHaveBeenCalled();

    unmount();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.stop).toHaveBeenCalled();

    (engineHook.useEngine as jest.Mock).mockRestore();
  });
});
