import { useMemo } from 'react';
import Matter from 'matter-js';

/**
 * Provides the Matter.js API through a hook so components don't
 * import the library directly.
 */
export const useMatter = () => useMemo(() => Matter, []);
