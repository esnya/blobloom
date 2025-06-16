import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import type { CharEffects } from '../hooks/useCharEffects';
import { useCharEffectTimers } from '../hooks/useCharEffectTimers';

export interface CharEffectsProps {
  effects: CharEffects;
}

export function CharEffects({ effects }: CharEffectsProps): React.JSX.Element {
  const { chars, removeChar } = effects;
  const { spawnTimeout, getNodeRef, clear } = useCharEffectTimers();

  React.useEffect(() => {
    chars.forEach((c) => {
      spawnTimeout(c.id, c.delay, () => {
        removeChar(c.id);
      });
    });
  }, [chars, removeChar, spawnTimeout]);
  return (
    <div className="chars">
      <TransitionGroup component={null}>
        {chars.map((c) => {
          const nodeRef = getNodeRef(c.id);
          return (
            <CSSTransition
              key={c.id}
              nodeRef={nodeRef}
              timeout={Math.round((2 + c.delay) * 1000)}
              onExited={() => {
                c.onEnd();
                clear(c.id);
              }}
            >
              <span
                // eslint-disable-next-line no-restricted-syntax
                ref={nodeRef}
                className={c.cls}
                style={{
                  '--x': `${c.offset.x}px`,
                  '--y': `${c.offset.y}px`,
                  '--rotate': c.rotate,
                  animationDelay: `${c.delay}s`,
                  ...(c.color ? { color: c.color } : {}),
                } as React.CSSProperties}
              >
                {c.char}
              </span>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
}
