import React, { useState } from 'react';
import { 
  Zap, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  FileCode, 
  ArrowRight, 
  Flame, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';
import { downloadSingleConfigFile, exportCustomServersZip } from '../utils/zipExport';

interface FlagshipTrioViewerProps {
  servers: ServerConfig[];
  onSelectAndSimulate: (server: ServerConfig) => void;
  onGoToAssets: () => void;
}

export const FlagshipTrioViewer: React.FC<FlagshipTrioViewerProps> = ({
  servers,
  onSelectAndSimulate,
  onGoToAssets,
}) => {
  const [activeProfile, setActiveProfile] = useState<'bd' | 'sg' | 'jp'>('bd');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Retrieve the 3 specific servers
  const bdServer = servers.find((s) => s.filename.includes('Bangladesh')) || servers[4];
  const sgServer = servers.find((s) => s.filename.includes('Singapore')) || servers[3];
  const jpServer = servers.find((s) => s.filename.includes('Japan')) || servers[0];

  const trioList = [
    {
      key: 'bd' as const,
      server: bdServer,
      badge: 'BDIX Ultra-Speed (8ms)',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tagline: 'Local Bangladesh Internet Exchange direct ISP peering',
      routingPath: 'Dhaka Local IX (AmberIT, Link3, Carnival, BTCL)',
      batteryRating: 'A+ (Minimal Drain via AES-128-GCM)',
      streamingRate: '4K BDIX FTP & Live TV',
    },
    {
      key: 'sg' as const,
      server: sgServer,
      badge: 'Lowest Ping International (38ms)',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      tagline: 'Direct Submarine Cable route via SMW-4 & SMW-5',
      routingPath: 'Cox\'s Bazar / Kuakata Landing -> Singapore Jurong',
      batteryRating: 'A (Balanced AES-256-GCM)',
      streamingRate: 'Full HD & Southeast Asia Gaming',
    },
    {
      key: 'jp' as const,
      server: jpServer,
      badge: 'Asian Gaming & Anime (85ms)',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      tagline: 'Asia Submarine-cable Express (ASE) to Tokyo data center',
      routingPath: 'Singapore Transit -> Tokyo Equinix TY2',
      batteryRating: 'A (Full Military-Grade Encryption)',
      streamingRate: 'Tokyo Netflix, AbemaTV & Low Jitter Gaming',
    },
  ];

  const currentSelection = trioList.find((t) => t.key === activeProfile)!;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTrioZip = async () => {
    await exportCustomServersZip(
      [bdServer, sgServer, jpServer],
      'BanglaVPN33_Flagship_Trio_Configs.zip'
    );
  };

  const lines = currentSelection.server.rawConfig.split('\n');

  return (
    <div className="space-y-6">
      
      {/* Path Breadcrumb & Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Sparkles className="w-4 h-4" />
            <span>BanglaVPN 33 Flagship Asset Profiles</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-semibold">Trio Bundle</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono tracking-tight">
            (Japan, Singapore, Bangladesh BDIX).conf
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            The three cornerstone configurations bundled into <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code> for maximum performance across local caching, low-ping Southeast Asian gaming, and global Japanese streaming.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTrioZip}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download Trio ZIP (3 Files)</span>
          </button>
        </div>
      </div>

      {/* 3 Interactive Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trioList.map(({ key, server, badge, badgeColor, tagline }) => {
          const isActive = activeProfile === key;

          return (
            <div
              key={key}
              onClick={() => setActiveProfile(key)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl select-none">{server.flag}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                    {server.ping} ms
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-3 font-mono">
                  {server.filename}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {server.cipher}
                </span>
                <span className={`font-medium ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isActive ? 'Active View' : 'Inspect →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Direct Technical Comparison Matrix
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Optimized for Android 7.0 - 14.0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Metric / Feature</th>
                <th className="py-3 px-4 font-medium text-emerald-400">🇧🇩 Bangladesh (Dhaka BDIX)</th>
                <th className="py-3 px-4 font-medium text-sky-400">🇸🇬 Singapore (SG Fast)</th>
                <th className="py-3 px-4 font-medium text-purple-400">🇯🇵 Japan (Tokyo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Target File in Assets</td>
                <td className="py-2.5 px-4 text-slate-200">Bangladesh (Dhaka BDIX).conf</td>
                <td className="py-2.5 px-4 text-slate-200">Singapore (SG Fast).conf</td>
                <td className="py-2.5 px-4 text-slate-200">Japan (example).conf</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Round-Trip Latency (Ping)</td>
                <td className="py-2.5 px-4 text-emerald-400 font-bold">~8 ms (Ultra-Fast)</td>
                <td className="py-2.5 px-4 text-sky-400 font-bold">~38 ms (Low Ping)</td>
                <td className="py-2.5 px-4 text-purple-400 font-bold">~85 ms (Low Jitter)</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Encryption Cipher</td>
                <td className="py-2.5 px-4 text-slate-300">AES-128-GCM (Low CPU)</td>
                <td className="py-2.5 px-4 text-slate-300">AES-256-GCM</td>
                <td className="py-2.5 px-4 text-slate-300">AES-256-GCM</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Submarine Cable Transit</td>
                <td className="py-2.5 px-4 text-slate-300">Zero international cable transit</td>
                <td className="py-2.5 px-4 text-slate-300">SMW-4 / SMW-5 Direct Hop</td>
                <td className="py-2.5 px-4 text-slate-300">SMW-5 + ASE Express</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Best For (Use Case)</td>
                <td className="py-2.5 px-4 text-emerald-300 font-sans">BDIX FTP, SamOnline, CircleFTP, TV</td>
                <td className="py-2.5 px-4 text-sky-300 font-sans">PUBG, Free Fire, SEA Servers</td>
                <td className="py-2.5 px-4 text-purple-300 font-sans">Anime, Tokyo Media, Unrestricted Web</td>
              </tr>
              <tr className="hover:bg-slate-850/40">
                <td className="py-2.5 px-4 text-slate-400 font-sans">Android Battery Consumption</td>
                <td className="py-2.5 px-4 text-emerald-400">Lowest (0.8%/hr)</td>
                <td className="py-2.5 px-4 text-slate-300">Low (1.2%/hr)</td>
                <td className="py-2.5 px-4 text-slate-300">Low (1.3%/hr)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Configuration Inspector for Selected Server */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-xl select-none">{currentSelection.server.flag}</span>
            <div className="truncate">
              <span className="text-xs font-mono font-semibold text-white block truncate">
                {currentSelection.server.filename}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block truncate">
                app/src/main/assets/servers/{currentSelection.server.filename}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentSelection.server.rawConfig, currentSelection.key)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              {copiedId === currentSelection.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === currentSelection.key ? 'Copied' : 'Copy .conf'}</span>
            </button>

            <button
              onClick={() => downloadSingleConfigFile(currentSelection.server)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => onSelectAndSimulate(currentSelection.server)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch in Simulator</span>
            </button>
          </div>
        </div>

        {/* Specs bar */}
        <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">✓ Production Validated</span>
            <span>·</span>
            <span>{currentSelection.server.host}:{currentSelection.server.port}</span>
            <span>·</span>
            <span>{currentSelection.server.protocol.toUpperCase()}</span>
          </div>

          <div>
            <span>{lines.length} lines</span>
          </div>
        </div>

        {/* Code Content */}
        <div className="bg-slate-950 p-4 font-mono text-xs flex max-h-[460px] overflow-auto">
          <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 leading-relaxed font-mono">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <pre className="pl-4 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre w-full">
            <code>{currentSelection.server.rawConfig}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
