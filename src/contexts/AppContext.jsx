import { createContext, useContext } from 'react';

// The provider lives in AppProvider.jsx so this file exports no components
// (keeps React Fast Refresh working for both).
export const AppContext = createContext(null);

export function useAppContext() {
    return useContext(AppContext);
}
