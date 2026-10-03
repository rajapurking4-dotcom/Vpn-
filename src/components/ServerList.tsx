import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  Zap, 
  Smartphone, 
  FolderCheck,
  Shield,
  FileCode,
  ArrowUpDown,
  LayoutGrid,
  List,
  Copy,
  Check,
  Save,
  ShieldCheck,
  Plus,
  Upload,
  Code
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';
import { downloadSingleConfigFile, exportServersZip } from '../utils/zipExport';
import { README_CONTENT } from '../data/defaultServers';
import { BdixBadge, isServerBdixOptimized } from './BdixBadge';

interface ServerListProps {
  servers: ServerConfig[];
  selectedServer: ServerConfig;
  onSelectServer: (server: ServerConfig) => void;
  onOpenConfigEditor: (server: ServerConfig) => void;
  onDeleteServer: (serverId: string) => void;
  onOpenSimulator: (server: ServerConfig) => void;
  onOpenNewServerModal: () => void;
  onUpdateServerConfig: (updated: ServerConfig) => void;
}

export const ServerList: React.FC<ServerListProps> = ({
  servers,
  selectedServer,
  onSelectServer,
  onOpenConfigEditor,
  onDeleteServer,
  onOpenSimulator,
  onOpenNewServerModal,
  onUpdateServerConfig,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'ping' | 'name' | 'load'>('ping');
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [savedInlineNotice, setSavedInlineNotice] = useState(false);
  const [inlineConfig, setInlineConfig] = useState(selectedServer.rawConfig);
  const [selectedSpecialFile, setSelectedSpecialFile] = useState<'server' | 'readme'>('server');

  // Synchronize inlineConfig when selectedServer changes
  React.useEffect(() => {
    setInlineConfig(selectedServer.rawConfig);
    setSelectedSpecialFile('server');
  }, [selectedServer]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveInline = () => {
    if (selectedSpecialFile === 'server') {
      onUpdateServerConfig({
        ...selectedServer,
        rawConfig: inlineConfig,
      });
      setSavedInlineNotice(true);
      setTimeout(() => setSavedInlineNotice(false), 2000);
    }
  };

  // Filter and sort servers
  const filteredServers = servers
    .filter((s) => {
      const matchSearch =
        s.country.toLowerCase().includes(search.toLowerCase()) ||
        s.filename.toLowerCase().includes(search.toLowerCase()) ||
        s.host.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === 'All' || s.category === categoryFilter;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'ping') return a.ping - b.ping;
      if (sortBy === 'load') return a.load - b.load;
      return a.country.localeCompare(b.country);
    });

  const categories = ['All', 'BDIX', 'Free', 'VIP', 'Gaming', 'Streaming'];

  const displayedContent = selectedSpecialFile === 'readme' ? README_CONTENT : inlineConfig;
  const lines = displayedContent.split('\n');

  return (
    <div className="space-y-6">
      
      {/* Directory path header banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <FolderCheck className="w-4 h-4" />
            <span>Android Project Assets</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-semibold">{servers.length} Server Configs</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">1 Documentation file</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
              app/src/main/assets/servers/
            </h1>
            <button
              onClick={() => handleCopy('app/src/main/assets/servers', 'path-copy')}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors"
              title="Copy Android assets path"
            >
              {copiedText === 'path-copy' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            In BanglaVpn33, all OpenVPN and WireGuard server profiles (<code className="text-emerald-300 font-mono">.conf</code>) are placed in this assets folder. <code className="text-emerald-300 font-mono">MainActivity.kt</code> calls <code className="text-emerald-300 font-mono">assets.list("servers")</code> to populate the server selection list. Private key pairs generated with <code className="text-emerald-300 font-mono">umask 077</code>.
          </p>
        </div>

        {/* Quick actions for assets directory */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewServerModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add .conf File</span>
          </button>

          <button
            onClick={() => exportServersZip(servers)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download All (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Filter, Search, and View Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search .conf by country, host, protocol..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        {/* Categories, Sort, and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categories */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none font-medium text-xs cursor-pointer"
            >
              <option value="ping" className="bg-slate-900">Lowest Ping</option>
              <option value="load" className="bg-slate-900">Server Load</option>
              <option value="name" className="bg-slate-900">Country Name</option>
            </select>
          </div>

          {/* View mode toggle: Split vs Grid */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split File Explorer & Inline Config Inspector"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* VIEW MODE 1: Split File Explorer & Live Config Inspector */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: File Tree list in app/src/main/assets/servers/ */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>assets/servers/</span>
              </span>
              <span>{filteredServers.length + 1} files</span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[620px] overflow-y-auto">
              
              {/* Server files list */}
              {filteredServers.map((server) => {
                const isSelected = selectedSpecialFile === 'server' && selectedServer.id === server.id;

                return (
                  <div
                    key={server.id}
                    onClick={() => {
                      onSelectServer(server);
                      setSelectedSpecialFile('server');
                    }}
                    className={`p-3.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400'
                        : 'hover:bg-slate-850/60 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl select-none shrink-0">{server.flag}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white truncate font-mono">
                            {server.filename}
                          </h4>
                          {isServerBdixOptimized(server) && (
                            <BdixBadge variant="minimal" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {server.country} ({server.city}) · <span className="font-mono text-slate-300">{server.host}:{server.port}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 uppercase text-[10px]">
                        {server.protocol}
                      </span>
                      <span className="text-emerald-400 tabular-nums">
                        {server.ping}ms
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* README.txt file */}
              <div
                onClick={() => setSelectedSpecialFile('readme')}
                className={`p-3.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  selectedSpecialFile === 'readme'
                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400'
                    : 'hover:bg-slate-850/60 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-300">
                    txt
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-white truncate font-mono">
                      README.txt
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Android asset integration instructions
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Docs
                </span>
              </div>

            </div>

            {/* Quick footer note */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Android assets read via Kotlin</span>
              <button
                onClick={onOpenNewServerModal}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                + Add server
              </button>
            </div>
          </div>

          {/* Right Column: Instant Live Config Inspector & Editor */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-white block truncate">
                      {selectedSpecialFile === 'readme' ? 'README.txt' : selectedServer.filename}
                    </span>
                    {selectedSpecialFile === 'server' && isServerBdixOptimized(selectedServer) && (
                      <BdixBadge variant="glow" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block truncate">
                    app/src/main/assets/servers/{selectedSpecialFile === 'readme' ? 'README.txt' : selectedServer.filename}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(displayedContent, 'inline-copy')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  {copiedText === 'inline-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === 'inline-copy' ? 'Copied' : 'Copy'}</span>
                </button>

                {selectedSpecialFile === 'server' && (
                  <>
                    <button
                      onClick={() => downloadSingleConfigFile(selectedServer)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => onOpenSimulator(selectedServer)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Test in App</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Validation / Specs Bar */}
            {selectedSpecialFile === 'server' && (
              <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Valid OpenVPN
                  </span>
                  <span>·</span>
                  <span>{selectedServer.protocol.toUpperCase()} {selectedServer.port}</span>
                  <span>·</span>
                  <span>{selectedServer.cipher}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>{lines.length} lines</span>
                  <span>·</span>
                  <span>{displayedContent.length} bytes</span>
                </div>
              </div>
            )}

            {/* Code Content */}
            <div className="bg-slate-950 p-4 font-mono text-xs flex max-h-[460px] overflow-auto">
              <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 leading-relaxed font-mono">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {selectedSpecialFile === 'server' ? (
                <textarea
                  value={inlineConfig}
                  onChange={(e) => setInlineConfig(e.target.value)}
                  className="flex-1 bg-transparent text-slate-200 pl-4 resize-none focus:outline-none font-mono leading-relaxed selection:bg-emerald-500/30 w-full min-h-[360px]"
                  spellCheck={false}
                />
              ) : (
                <pre className="pl-4 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
                  <code>{displayedContent}</code>
                </pre>
              )}
            </div>

            {/* Save bar if server file */}
            {selectedSpecialFile === 'server' && (
              <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Directly edit directives or certificates.
                </span>

                <div className="flex items-center gap-3">
                  {savedInlineNotice && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Saved configuration!
                    </span>
                  )}
                  <button
                    onClick={handleSaveInline}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW MODE 2: Card Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => {
            const isSelected = selectedServer.id === server.id;

            return (
              <div
                key={server.id}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between transition-all group ${
                  isSelected
                    ? 'border-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl select-none">{server.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {server.country}
                          </h3>
                          {isServerBdixOptimized(server) && (
                            <BdixBadge variant="glow" />
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block">
                          {server.city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded border font-medium ${
                        server.ping < 50
                          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                          : server.ping < 120
                          ? 'bg-sky-950/70 border-sky-800 text-sky-300'
                          : 'bg-amber-950/70 border-amber-800 text-amber-300'
                      }`}>
                        {server.ping}ms
                      </span>
                    </div>
                  </div>

                  {/* Filename in assets directory */}
                  <div className="mt-3.5 bg-slate-950/80 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate max-w-[210px]" title={server.filename}>
                      {server.filename}
                    </span>
                    <span className="text-slate-500 text-[10px] shrink-0 uppercase">
                      {server.protocol} :{server.port}
                    </span>
                  </div>

                  {/* Endpoint & Cipher metadata */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOST / IP</span>
                      <span className="font-mono text-slate-300 truncate block" title={server.host}>
                        {server.host}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CIPHER</span>
                      <span className="font-mono text-slate-300 truncate block">
                        {server.cipher}
                      </span>
                    </div>
                  </div>

                  {/* Server Load Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>Server Capacity</span>
                      <span>{server.load}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          server.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${server.load}%` }}
                      />
                    </div>
                  </div>

                  {server.recommendedFor && (
                    <p className="mt-2 text-[11px] text-slate-500 italic line-clamp-1">
                      💡 {server.recommendedFor}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => {
                      onSelectServer(server);
                      onOpenConfigEditor(server);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
                    title="View and edit .conf contents"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onOpenSimulator(server)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-800/40"
                    title="Test in Android Mobile Simulator"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Simulate</span>
                  </button>

                  <button
                    onClick={() => downloadSingleConfigFile(server)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Download .conf file"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {server.isCustom && (
                    <button
                      onClick={() => onDeleteServer(server.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 transition-colors"
                      title="Remove custom server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kotlin Android Asset Integration Reference Box */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Code className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">
              Android Kotlin Code Reference (<code className="font-mono text-emerald-300">MainActivity.kt</code>)
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              To read these assets in your app: <code className="text-slate-300 font-mono">val files = context.assets.list("servers")</code> then <code className="text-slate-300 font-mono">assets.open("servers/$filename")</code>.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopy(`val serverFiles = context.assets.list("servers")\nval config = context.assets.open("servers/" + filename).bufferedReader().use { it.readText() }`, 'kotlin-snippet')}
          className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 shrink-0 self-start md:self-center"
        >
          {copiedText === 'kotlin-snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copiedText === 'kotlin-snippet' ? 'Copied' : 'Copy Kotlin Snippet'}</span>
        </button>
      </div>

    </div>
  );
};
