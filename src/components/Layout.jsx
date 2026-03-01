import React from 'react';
import Sidebar from './Sidebar';
import ProfilePanel from './ProfilePanel';
import VersusOverlay from './VersusOverlay';
import { Users, RotateCcw, Download, Sparkles, Activity } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Layout = ({
    children,
    motions,
    selectedCouncillor,
    setSelectedCouncillor,
    compareList,
    setCompareList,
    handleReset
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname.substring(1) || 'dashboard';

    const startComparison = (name) => {
        setCompareList([name]);
        setSelectedCouncillor(null);
    };

    return (
        <div className="dashboard-container">
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

            <Sidebar />

            <main className="main-content">
                {compareList.length === 1 && (
                    <div className="mb-6 p-4 bg-toronto-blue text-white rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3">
                            <Users size={20} />
                            <div>
                                <p className="text-sm font-bold">Comparison Mode Active</p>
                                <p className="text-xs opacity-90">Select another councillor below to compare with <strong>{compareList[0]}</strong></p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCompareList([])}
                            className="text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {currentPath !== 'reports' && (
                    <header className="section-header-premium">
                        <div className="header-content">
                            <h2 className="header-title">
                                {currentPath === 'wards' ? 'Ward Legislative Footprint' :
                                    currentPath.charAt(0).toUpperCase() + currentPath.slice(1) + ' Session Overview'}
                                <Sparkles size={20} className="text-amber-400 ml-2 inline-block" />
                            </h2>
                            <div className="view-indicator">
                                <Activity size={12} className="text-toronto-blue animate-pulse" />
                                <span className="text-[10px] font-bold tracking-tighter uppercase text-toronto-blue/70">Live Analytics Engine</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={handleReset}>
                                <RotateCcw size={14} />
                                Reset View
                            </button>
                            <Link
                                to="/reports"
                                className="btn-primary"
                            >
                                <Download size={14} />
                                Export Insights
                            </Link>
                        </div>
                    </header>
                )}

                {children}
            </main>
        </div>
    );
};

export default Layout;
