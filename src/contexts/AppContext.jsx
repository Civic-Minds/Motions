import React, { createContext, useContext, useState } from 'react';
import { getWardId, setWardId as saveWardId, getFollowedCommittees, setFollowedCommittees as saveFollowedCommittees } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [wardId, setWardId] = useState(() => getWardId());
    const [followedCommittees, setFollowedCommittees] = useState(() => getFollowedCommittees());

    const handleLocate = async () => {
        const { geolocateWard } = await import('../utils/ward');
        const id = await geolocateWard();
        setWardId(id);
        saveWardId(id);
    };

    const handleClearWard = () => {
        setWardId(null);
        saveWardId(null);
    };

    const handleToggleFollow = (name) => {
        const next = followedCommittees.includes(name)
            ? followedCommittees.filter(c => c !== name)
            : [...followedCommittees, name];
        setFollowedCommittees(next);
        saveFollowedCommittees(next);
    };

    return (
        <AppContext.Provider value={{ wardId, handleLocate, handleClearWard, followedCommittees, handleToggleFollow }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
