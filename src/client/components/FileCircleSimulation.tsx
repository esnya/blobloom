import React, { useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { PhysicsProvider } from '../hooks/useEngine';
import { PhysicsRunner } from '../hooks/useEngineRunner';
import { FileCircle } from './FileCircle';
import type { LineCount } from '../types';
import { computeScale } from '../scale';
import { useSize } from '../hooks/useSize';
import { useFileCircleRefs } from '../hooks/useFileCircleRefs';

interface FileCircleSimulationProps {
  data: LineCount[];
}

export function FileCircleSimulation({ data }: FileCircleSimulationProps): React.JSX.Element {
  const { ref: containerRef, size: bounds } = useSize<HTMLDivElement>();

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

  const { getRef, deleteRef } = useFileCircleRefs();

  return (
    <TransitionGroup component={null}>
      {data.map((d) => {
        const r = ((d.lines ** 0.5) * scale) / 2;
        if (r * 2 < 1) return null;
        const nodeRef = getRef(d.file);
        return (
          <CSSTransition
            key={d.file}
            nodeRef={nodeRef}
            timeout={500}
            classNames="file-circle-remove"
            onExited={() => {
              deleteRef(d.file);
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
