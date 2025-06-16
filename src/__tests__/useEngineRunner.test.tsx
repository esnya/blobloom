/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { PhysicsProvider } from '../client/hooks/useEngine';
import { useEngineRunner } from '../client/hooks/useEngineRunner';
import { Engine } from '../client/physics';

describe('useEngineRunner', () => {
  const Runner = () => {
    useEngineRunner();
    return null;
  };

  it('starts engine on mount and stops on unmount', () => {
    const engine = new Engine(10, 10);
    jest.spyOn(engine, 'start').mockImplementation(() => undefined);
    jest.spyOn(engine, 'stop').mockImplementation(() => undefined);

    const { unmount } = render(
      <PhysicsProvider bounds={{ width: 10, height: 10 }} engine={engine}>
        <Runner />
      </PhysicsProvider>,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.start).toHaveBeenCalled();

    unmount();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.stop).toHaveBeenCalled();
  });
});
