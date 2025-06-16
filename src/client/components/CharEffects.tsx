// eslint-disable-next-line no-restricted-syntax
import React, { useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import type { CharEffects } from '../hooks/useCharEffects';

export interface CharEffectsProps {
  effects: CharEffects;
}

export function CharEffects({ effects }: CharEffectsProps): React.JSX.Element {
  const { chars, removeChar } = effects;
  // eslint-disable-next-line no-restricted-syntax
  const refs = useRef(new Map<string, React.RefObject<HTMLSpanElement>>());
  // eslint-disable-next-line no-restricted-syntax
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  React.useEffect(() => {
    const map = timers.current;
    chars.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(
          c.id,
          setTimeout(() => {
            removeChar(c.id);
          }, Math.round((2 + c.delay) * 1000)),
        );
      }
    });
  }, [chars, removeChar]);

  React.useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    },
    [],
  );
  return (
    <div className="chars">
      <TransitionGroup component={null}>
        {chars.map((c) => {
          let nodeRef = refs.current.get(c.id);
          if (!nodeRef) {
            // eslint-disable-next-line no-restricted-syntax
            nodeRef = React.createRef<HTMLSpanElement>() as React.RefObject<HTMLSpanElement>;
            refs.current.set(c.id, nodeRef);
          }
          return (
            <CSSTransition
              key={c.id}
              nodeRef={nodeRef}
              timeout={Math.round((2 + c.delay) * 1000)}
            onExited={() => {
              c.onEnd();
              refs.current.delete(c.id);
              timers.current.delete(c.id);
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
