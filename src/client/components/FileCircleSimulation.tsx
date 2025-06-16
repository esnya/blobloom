import React, { useMemo, useRef } from 'react'; // eslint-disable-line no-restricted-syntax
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { PhysicsProvider } from '../hooks/useEngine';
import { PhysicsRunner } from '../hooks/useEngineRunner';
import { FileCircle } from './FileCircle';
import type { LineCount } from '../types';
import { computeScale } from '../scale';
import { useContainerBounds } from '../hooks/useContainerBounds';

interface FileCircleSimulationProps {
  data: LineCount[];
}

export function FileCircleSimulation({ data }: FileCircleSimulationProps): React.JSX.Element {
  const { ref: containerRef, bounds } = useContainerBounds();

  return (
    // eslint-disable-next-line no-restricted-syntax
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {bounds.width > 0 && (
        <PhysicsProvider bounds={bounds}>
          <PhysicsRunner>
            <FileCircleList data={data} bounds={bounds} />
          </PhysicsRunner>
        </PhysicsProvider>
      )}
    </div>
  );
}

export interface FileCircleListProps {
  data: LineCount[];
  bounds: { width: number; height: number };
  linear?: boolean;
}

export function FileCircleList({ data, bounds, linear }: FileCircleListProps): React.JSX.Element {
  const scale = useMemo(
    () =>
      computeScale(
        bounds.width,
        bounds.height,
        data,
        linear !== undefined ? { linear } : {},
      ),
    [bounds.width, bounds.height, data, linear],
  );

  const refs = useRef(new Map<string, React.RefObject<HTMLDivElement>>()); // eslint-disable-line no-restricted-syntax

  return (
    <TransitionGroup component={null}>
      {data.map((d) => {
        const r = (Math.pow(d.lines, 0.5) * scale) / 2;
        if (r * 2 < 1) return null;
        let nodeRef = refs.current.get(d.file);
        if (!nodeRef) {
          // eslint-disable-next-line no-restricted-syntax
          nodeRef = React.createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
          refs.current.set(d.file, nodeRef);
        }
        return (
          <CSSTransition
            key={d.file}
            nodeRef={nodeRef}
            timeout={500}
            classNames="file-circle-remove"
            onExited={() => {
              refs.current.delete(d.file);
            }}
          >
            {/* eslint-disable-next-line no-restricted-syntax */}
            <FileCircle ref={nodeRef} file={d.file} lines={d.lines} radius={r} />
          </CSSTransition>
        );
      })}
    </TransitionGroup>
  );
}
