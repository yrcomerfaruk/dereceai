'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type SetActionsType = (actions: ReactNode) => void;

const HeaderStateContext = createContext<ReactNode>(null);
const HeaderSetContext = createContext<SetActionsType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);

    // We wrap the setter in useCallback to keep it stable, but since it depends on 
    // setHeaderActions which is already stable from useState, this is just extra safety.
    const setActions = useCallback((actions: ReactNode) => {
        setHeaderActions(actions);
    }, []);

    return (
        <HeaderStateContext.Provider value={headerActions}>
            <HeaderSetContext.Provider value={setActions}>
                {children}
            </HeaderSetContext.Provider>
        </HeaderStateContext.Provider>
    );
}

/**
 * Hook for pages to set their specific header actions.
 * Separating the setter from the state prevents the page from re-rendering
 * when it updates the header.
 */
export function useHeaderActions(actions: ReactNode) {
    const setHeaderActions = useContext(HeaderSetContext);

    if (!setHeaderActions) {
        throw new Error('useHeaderActions must be used within a HeaderProvider');
    }

    useEffect(() => {
        setHeaderActions(actions);
        return () => setHeaderActions(null);
    }, [actions, setHeaderActions]);
}

/**
 * Hook for the Layout to display the current header actions.
 */
export function useHeaderActionsDisplay() {
    return useContext(HeaderStateContext);
}
