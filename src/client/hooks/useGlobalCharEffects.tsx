import React, { createContext, useContext } from 'react';
import { useCharEffects, type CharEffects } from './useCharEffects';
import { CharEffects as Effects } from '../components/CharEffects';

const CharEffectsContext = createContext<CharEffects | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export function CharEffectsProvider({ children }: ProviderProps): React.JSX.Element {
  const effects = useCharEffects();
  return (
    <CharEffectsContext.Provider value={effects}>
      {children}
      <Effects effects={effects} />
    </CharEffectsContext.Provider>
  );
}

export const useGlobalCharEffects = (): CharEffects => {
  const ctx = useContext(CharEffectsContext);
  if (!ctx) throw new Error('useGlobalCharEffects must be used within CharEffectsProvider');
  return ctx;
};
