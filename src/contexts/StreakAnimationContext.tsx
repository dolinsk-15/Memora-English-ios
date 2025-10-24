import React, { createContext, useContext, ReactNode, useRef } from 'react';

interface StreakAnimationContextType {
  // Вызывается из экранов (повторения, экзамен и т.д.) при увеличении streak
  trigger: (newStreak: number) => void;
  // Регистрирует обработчик, который выполнит конкретную анимацию (в нашем случае – в таббаре)
  setHandler: (handler: (newStreak: number) => void) => void;
}

const StreakAnimationContext = createContext<StreakAnimationContextType | undefined>(undefined);

export const useStreakAnimation = () => {
  const ctx = useContext(StreakAnimationContext);
  if (!ctx) throw new Error('useStreakAnimation must be used within StreakAnimationProvider');
  return ctx;
};

export const StreakAnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handlerRef = useRef<(newStreak: number) => void>(() => {});

  const setHandler = (handler: (newStreak: number) => void) => {
    handlerRef.current = handler;
  };

  const trigger = (newStreak: number) => {
    if (handlerRef.current) handlerRef.current(newStreak);
  };

  return (
    <StreakAnimationContext.Provider value={{ trigger, setHandler }}>
      {children}
    </StreakAnimationContext.Provider>
  );
}; 