import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import ProfilePanel from './ProfilePanel';
import VersusOverlay from './VersusOverlay';

const Layout = ({
    children,
    motions,
    selectedCouncillor,
    setSelectedCouncillor,
    compareList,
    setCompareList,
    handleReset,
}) => {
    const location = useLocation();

    const startComparison = (name) => {
        setCompareList([name]);
        setSelectedCouncillor(null);
    };

    return (
        <div className="app-container">
            <ProfilePanel
                selected={selectedCouncillor}
                onCompare={startComparison}
                onClose={() => setSelectedCouncillor(null)}
                motions={motions}
            />
            <VersusOverlay
                selection={compareList}
                onClose={() => setCompareList([])}
                motions={motions}
            />

            <Navbar />

            <main className="main-content">
                <AnimatePresence>
                    {compareList.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="mb-6 p-4 bg-[#004a99] text-white rounded-xl flex justify-between items-center"
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} />
                                <div>
                                    <p className="text-sm font-bold">Comparison Mode Active</p>
                                    <p className="text-xs opacity-90">Select another councillor to compare with <strong>{compareList[0]}</strong></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCompareList([])}
                                className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
