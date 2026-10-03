import React from 'react';
import { Download, Plus, Smartphone, FolderTree, Code2, Activity, PackageCheck, Terminal, Server, Globe, Sparkles } from 'lucide-react';

export type NavTab = 'servers' | 'trio' | 'ip-check' | 'wg-conf' | 'wg-setup' | 'apk' | 'simulator' | 'code' | 'probe';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewServerModal: () => void;
  onExportZip: () => void;
  serverCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewServerModal,
  onExportZip,
  serverCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-base shadow-inner">
            33
          </div>
          <div>
            <a 
              href="#assets" 
              onClick={(e) => { e.preventDefault(); setActiveTab('servers'); }}
              className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
            >
              BanglaVPN 33
            </a>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
              Build & Server Hub
            </span>
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('trio')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'trio'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Flagship Trio (JP, SG, BD)</span>
          </button>

          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'servers'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>assets/servers ({serverCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ip-check')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'ip-check'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>api.ipify.org</span>
          </button>

          <button
            onClick={() => setActiveTab('wg-conf')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'wg-conf'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>wg0.conf</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'apk'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>apk/debug/</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${
              activeTab === 'simulator'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulator</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewServerModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Server</span>
          </button>

          <button
            onClick={onExportZip}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            title="Download ready-to-use Android app/src/main/assets/servers zip"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Export Assets ZIP</span>
          </button>
        </div>

      </div>

      {/* Responsive mobile/tablet navigation bar row */}
      <div className="xl:hidden flex items-center justify-between overflow-x-auto border-t border-slate-800/80 px-3 py-2 text-xs font-medium text-slate-400 bg-slate-950 gap-2 whitespace-nowrap">
        <button
          onClick={() => setActiveTab('trio')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${activeTab === 'trio' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          <span>Trio (JP, SG, BD)</span>
        </button>
        <button
          onClick={() => setActiveTab('servers')}
          className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'servers' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          assets/servers
        </button>
        <button
          onClick={() => setActiveTab('ip-check')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${activeTab === 'ip-check' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          <span>api.ipify.org</span>
        </button>
        <button
          onClick={() => setActiveTab('wg-conf')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${activeTab === 'wg-conf' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          <span>wg0.conf</span>
        </button>
        <button
          onClick={() => setActiveTab('apk')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${activeTab === 'apk' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          <span>apk/debug/</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'simulator' ? 'text-emerald-400 bg-slate-900 font-semibold' : 'hover:text-slate-200'}`}
        >
          Simulator
        </button>
      </div>
    </header>
  );
};
