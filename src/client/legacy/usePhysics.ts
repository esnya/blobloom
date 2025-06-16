import { useMemo } from 'react';
import * as Physics from '../physics';

/**
 * Provides the simple physics API through a hook so components don't
 * import the library directly.
 */
export const usePhysics = () => useMemo(() => Physics, []);
