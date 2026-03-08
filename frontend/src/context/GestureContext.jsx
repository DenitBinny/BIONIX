import React, { createContext, useContext, useState } from 'react';

const GestureContext = createContext();

export function GestureProvider({ children }) {
  const [gestureIndex, setGestureIndex] = useState(0);

  return (
    <GestureContext.Provider value={{ gestureIndex, setGestureIndex }}>
      {children}
    </GestureContext.Provider>
  );
}

export function useGesture() {
  return useContext(GestureContext);
}
