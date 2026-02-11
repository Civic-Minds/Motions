import React, { useState } from 'react';
import {
  BarChart3,
  Search,
  MapPin,
  TrendingUp,
  AlertCircle,
  Filter,
  Users,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Database,
  Bus,
  Home
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const mockMotions = [
  { id: 'MM35.15', date: 'Oct 22, 2024', title: 'Transit Signal Priority Pilot', mover: 'Mayor Olivia Chow', status: 'Passed', trivial: false },
  { id: 'MM34.12', date: 'Oct 21, 2024', title: 'Park Green Space Allocation', mover: 'Cllr. Brad Bradford', status: 'Passed', trivial: false },
  { id: 'MM33.05', date: 'Oct 18, 2024', title: 'Administrative Procedure Review', mover: 'Cllr. Stephen Holyday', status: 'Referred', trivial: true },
  { id: 'MM33.02', date: 'Oct 17, 2024', title: 'Trash Bin Relocation Program', mover: 'Cllr. Paul Ainslie', status: 'Passed', trivial: true },
];

const dashboardData = [
  { name: 'Policy', value: 78, color: '#2d6a4f' },
  { name: 'Admin', value: 22, color: '#cbd5e1' },
];

const AlignmentHeatmap = ({ onSelect }) => {
  const councillors = ['Ainslie', 'Bradford', 'Chow', 'Malik', 'Myers', 'Holyday', 'Burnside', 'Carroll', 'Cheng', 'Mantas'];
  return (
    <div className="councillor-alignment-grid">
      {councillors.map((c, i) => (
        <div
          key={i}
          onClick={() => onSelect(c)}
          className="p-3 border border-[#e2e8f0] rounded-lg bg-slate-50/50 hover:border-[#004a99] cursor-pointer transition-all active:scale-95 group"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-[#64748b] font-bold uppercase group-hover:text-[#004a99]">{c}</p>
            <span className="text-[10px] font-mono font-bold text-[#004a99]">85%</span>
          </div>
          <div className="h-1.5 w-full bg-[#cbd5e1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004a99]"
              style={{ width: `${Math.floor(Math.random() * 30) + 65}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProfilePanel = ({ selected, onClose }) => {
  const isOpen = !!selected;

  // Mock DNA data lookup based on councillor
  const getDNA = (name) => {
    const dnaConfigs = {
      'Chow': [
        { topic: 'Transit', yes: 95, no: 5, alignment: 'Champion' },
        { topic: 'Housing', yes: 90, no: 10, alignment: 'High focus' },
        { topic: 'Budget', yes: 85, no: 15, alignment: 'Stable' },
      ],
      'Holyday': [
        { topic: 'Transit', yes: 15, no: 85, alignment: 'Economic Caution' },
        { topic: 'Housing', yes: 45, no: 55, alignment: 'Selective' },
        { topic: 'Budget', yes: 98, no: 2, alignment: 'Strong focus' },
      ],
      'Bradford': [
        { topic: 'Transit', yes: 75, no: 25, alignment: 'Supporter' },
        { topic: 'Housing', yes: 88, no: 12, alignment: 'High alignment' },
        { topic: 'Budget', yes: 60, no: 40, alignment: 'Balanced' },
      ],
      'Ainslie': [
        { topic: 'Transit', yes: 82, no: 18, alignment: 'Supporter' },
        { topic: 'Housing', yes: 40, no: 60, alignment: 'Conditional' },
        { topic: 'Budget', yes: 70, no: 30, alignment: 'Pragmatic' },
      ]
    };
    return dnaConfigs[name] || [
      { topic: 'Transit', yes: 60, no: 40, alignment: 'Standard' },
      { topic: 'Housing', yes: 60, no: 40, alignment: 'Standard' },
      { topic: 'Budget', yes: 60, no: 40, alignment: 'Standard' },
    ];
  };

  const currentDNA = getDNA(selected);

  const getStances = (name) => {
    return [
      { topic: 'Transit', stance: name === 'Holyday' ? 'NO' : 'YES', title: 'MM35.15: Signal Priority expansion' },
      { topic: 'Housing', stance: name === 'Ainslie' ? 'NO' : 'YES', title: 'MM34.12: Modular Housing pilot' },
      { topic: 'Transit', stance: 'YES', title: 'MM33.02: TTC Green Fleet transition' },
      { topic: 'Admin', stance: 'NO', title: 'MM33.05: Procedural review update' },
    ];
  };

  return (
    <div className={`profile-panel ${isOpen ? 'open' : ''}`}>
      <div className="profile-header flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Councillor<br />{selected || 'Profile'}</h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">Spadina-Fort York • Ward 10</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCompare(selected)}
            className="px-3 py-1.5 bg-toronto-blue text-white text-[10px] font-bold rounded-lg hover:bg-blue-800 transition-colors uppercase tracking-wider"
          >
            Versus Mode
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Voting DNA (% Support)</h3>
          <div className="space-y-4">
            {currentDNA.map((item, i) => (
              <div key={i} className="dna-stat">
                <div className="dna-label">
                  <span>{item.topic}</span>
                  <span className={item.yes > 50 ? 'text-emerald-600' : 'text-rose-500'}>
                    {item.yes}% Yes
                  </span>
                </div>
                <div className="sentiment-bar">
                  <div className="sentiment-yes" style={{ width: `${item.yes}%` }}></div>
                  <div className="sentiment-no" style={{ width: `${item.no}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-bold uppercase">
                  <span className="text-slate-400">{item.alignment}</span>
                  <span className="text-slate-300">Targeting {item.yes > 50 ? 'Progress' : 'Economy'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Stance & "No" Votes</h3>
          <div className="space-y-2">
            {getStances(selected).map((item, i) => (
              <div key={i} className="p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className={`pill pill-${item.topic.toLowerCase()}`}>{item.topic}</span>
                  <span className={`text-[10px] font-bold ${item.stance === 'NO' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    Voted {item.stance}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">{item.title}</p>
                <p className="text-[10px] text-slate-400 mt-1">October 2024</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const VersusOverlay = ({ selection, onClose }) => {
  if (selection.length < 2) return null;
  const [c1, c2] = selection;

  // Mock Divergence Data
  const divergence = [
    { id: 'MM35.15', title: 'Transit Signal Priority Pilot', c1: 'YES', c2: 'NO', topic: 'Transit' },
    { id: 'MM34.02', title: 'Garden Suite Bylaw Update', c1: 'NO', c2: 'YES', topic: 'Housing' },
  ];

  return (
    <div className="versus-overlay open">
      <div className="versus-header">
        <div className="flex justify-between items-center px-8 py-6 bg-white">
          <h2 className="text-xl font-bold">Comparison: <span className="text-toronto-blue">{c1} vs {c2}</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight size={24} /></button>
        </div>
      </div>

      <div className="versus-content p-8">
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="card bg-slate-50 border-none shadow-none">
            <h3 className="text-lg font-bold mb-4">{c1}</h3>
            <div className="h-[200px] w-full bg-white rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-2">Voting DNA</p>
              <div className="flex items-center justify-center h-full text-slate-300">Chart {c1}</div>
            </div>
          </div>
          <div className="card bg-slate-50 border-none shadow-none">
            <h3 className="text-lg font-bold mb-4">{c2}</h3>
            <div className="h-[200px] w-full bg-white rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-400 uppercase font-bold mb-2">Voting DNA</p>
              <div className="flex items-center justify-center h-full text-slate-300">Chart {c2}</div>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Divergence Points</h3>
        <div className="space-y-3">
          {divergence.map((item, i) => (
            <div key={i} className="p-4 border border-slate-100 rounded-xl bg-white flex justify-between items-center">
              <div className="flex-1">
                <span className={`pill pill-${item.topic.toLowerCase()} mb-1 inline-block`}>{item.topic}</span>
                <p className="text-sm font-bold text-slate-800">{item.id}: {item.title}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold">{c1}</p>
                  <span className={`text-xs font-black ${item.c1 === 'YES' ? 'text-emerald-600' : 'text-rose-500'}`}>{item.c1}</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold">{c2}</p>
                  <span className={`text-xs font-black ${item.c2 === 'YES' ? 'text-emerald-600' : 'text-rose-500'}`}>{item.c1 !== 'YES' ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedCouncillor, setSelectedCouncillor] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const handleSelect = (name) => {
    if (compareList.length > 0) {
      if (compareList.includes(name)) {
        setCompareList(prev => prev.filter(c => c !== name));
      } else if (compareList.length < 2) {
        setCompareList(prev => [...prev, name]);
      }
    } else {
      setSelectedCouncillor(name);
    }
  };

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
      />

      <VersusOverlay
        selection={compareList}
        onClose={() => setCompareList([])}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          TORONTO COUNCIL<br />TRANSPARENCY
        </div>

        <nav className="nav-section">
          <h3>Navigate</h3>
          <div className="space-y-1">
            <a href="#" className="nav-item active"><LayoutDashboard size={18} /> Dashboard</a>
            <a href="#" className="nav-item"><FileText size={18} /> Reports</a>
            <a href="#" className="nav-item"><Database size={18} /> Open Data</a>
          </div>
        </nav>

        <nav className="nav-section">
          <h3>Topics</h3>
          <div className="space-y-1">
            <a href="#" className="nav-item"><Bus size={18} /> Transit</a>
            <a href="#" className="nav-item"><Home size={18} /> Housing</a>
          </div>
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">System Status</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            TMMIS Scraper Live
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="section-header flex justify-between items-end">
          <div>
            <h2>Council Session Overview</h2>
            <p className="text-muted">Data updated daily at 9:00 AM • October 2024</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50" onClick={() => setSelectedCouncillor(null)}>Clear View</button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">Generate Report</button>
          </div>
        </header>

        <div className="stats-grid">
          {/* Triviality Score Card */}
          <div className="card">
            <div className="card-title">
              TRIVIALITY SCORE
              <AlertCircle size={16} className="text-slate-400" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Score: <span className="text-emerald-700">78% Focus on Core</span>
              </p>
              <div className="score-bar-container mt-1">
                <div className="score-bar-fill" style={{ width: '78%' }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                <strong>Analysis:</strong> Council focus remains primarily on significant civic matters this session.
              </p>
            </div>
          </div>

          {/* Alignment Card */}
          <div className="card">
            <div className="card-title">
              MEMBER ALIGNMENT
              <Users size={16} className="text-slate-400" />
            </div>
            <AlignmentHeatmap onSelect={handleSelect} />
          </div>
        </div>

        {/* Recent Motions Table */}
        <div className="card">
          <div className="card-title">
            RECENT MOTIONS
            <Filter size={18} className="text-slate-400 cursor-pointer" />
          </div>
          <table className="motion-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Motion Title</th>
                <th>Moved By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMotions.map((m, i) => (
                <tr key={i}>
                  <td className="text-slate-500">{m.date}</td>
                  <td className="font-semibold">
                    <div className="flex items-center gap-2">
                      {m.title}
                      {m.trivial && <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">Minor</span>}
                    </div>
                  </td>
                  <td>{m.mover}</td>
                  <td>
                    <span className={`status-badge status-${m.status.toLowerCase()}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
