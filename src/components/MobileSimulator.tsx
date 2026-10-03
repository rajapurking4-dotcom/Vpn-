import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Wifi, 
  Battery, 
  Key, 
  ChevronRight, 
  ArrowDown, 
  ArrowUp, 
  ShieldCheck, 
  Globe, 
  Clock, 
  SlidersHorizontal,
  RotateCcw,
  Smartphone,
  Server,
  Radio,
  Check,
  Activity,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  Terminal,
  Shield,
  Layers
} from 'lucide-react';
import { ServerConfig, VpnConnectionStatus, VpnStats } from '../types/vpn';
import confetti from 'canvas-confetti';
import { NetworkTrafficChart } from './NetworkTrafficChart';
import { BdixBadge, isServerBdixOptimized } from './BdixBadge';

interface MobileSimulatorProps {
  servers: ServerConfig[];
  selectedServer: ServerConfig;
  onSelectServer: (server: ServerConfig) => void;
  status: VpnConnectionStatus;
  setStatus: React.Dispatch<React.SetStateAction<VpnConnectionStatus>>;
  stats: VpnStats;
  setStats: React.Dispatch<React.SetStateAction<VpnStats>>;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  servers,
  selectedServer,
  onSelectServer,
  status,
  setStatus,
  stats,
  setStats,
}) => {
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('12:30');
  const [clientIp] = useState('82.167.7.208');
  const [sequenceLogs, setSequenceLogs] = useState<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }[]>([]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Log connection status transitions
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    if (status === 'disconnected') {
      setSequenceLogs(prev => [
        { time, msg: 'Tunnel disconnected. Physical egress routes restored.', type: 'warn' },
        ...prev.slice(0, 9)
      ]);
    } else if (status === 'connecting') {
      setSequenceLogs(prev => [
        { time, msg: `DNS lookup for ${selectedServer.host} via 1.1.1.1. Handshake SYN sent.`, type: 'info' },
        ...prev.slice(0, 9)
      ]);
    } else if (status === 'authenticating') {
      setSequenceLogs(prev => [
        { time, msg: `WireGuard / TLS Curve25519 negotiation. Exchanging ephemeral keys.`, type: 'info' },
        ...prev.slice(0, 9)
      ]);
    } else if (status === 'assigning_ip') {
      setSequenceLogs(prev => [
        { time, msg: `TUN interface tun0 instantiated. Assigning IP ${stats.assignedIp} /24.`, type: 'info' },
        ...prev.slice(0, 9)
      ]);
    } else if (status === 'connected') {
      setSequenceLogs(prev => [
        { time, msg: `✓ Secure tunnel locked! Masquerading through ${selectedServer.city} node.`, type: 'success' },
        ...prev.slice(0, 9)
      ]);
    }
  }, [status, selectedServer, stats.assignedIp]);

  // Handle Connect / Disconnect flow
  const handleToggleVpn = () => {
    if (status === 'disconnected') {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('authenticating');
        setTimeout(() => {
          setStatus('assigning_ip');
          setTimeout(() => {
            setStatus('connected');
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#10b981', '#059669', '#34d399']
            });
          }, 600);
        }, 800);
      }, 700);
    } else if (status === 'connected' || status === 'connecting' || status === 'authenticating' || status === 'assigning_ip') {
      setStatus('disconnected');
      setStats(prev => ({
        ...prev,
        connectedDuration: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
      }));
    }
  };

  // Timer & Speed simulation when connected
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      setStats(prev => {
        const randDown = Math.floor(Math.random() * 800) + 1200; // 1.2 - 2.0 MB/s
        const randUp = Math.floor(Math.random() * 300) + 200;
        return {
          ...prev,
          connectedDuration: prev.connectedDuration + 1,
          downloadSpeed: randDown,
          uploadSpeed: randUp,
          totalDownloaded: parseFloat((prev.totalDownloaded + (randDown / 1024 / 10)).toFixed(2)),
          totalUploaded: parseFloat((prev.totalUploaded + (randUp / 1024 / 10)).toFixed(2)),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, setStats]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Stepper helper
  const getStepStatus = (step: number) => {
    // 1: DNS/Connecting, 2: Auth/Handshake, 3: IP Assign, 4: Connected
    if (status === 'disconnected') return 'idle';
    if (status === 'connecting') return step === 1 ? 'active' : 'pending';
    if (status === 'authenticating') return step < 2 ? 'done' : step === 2 ? 'active' : 'pending';
    if (status === 'assigning_ip') return step < 3 ? 'done' : step === 3 ? 'active' : 'pending';
    if (status === 'connected') return 'done';
    return 'idle';
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 py-4">
      {/* Device Frame */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] h-[740px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-[6px] border-slate-800 shadow-emerald-950/20 select-none shrink-0">
        
        {/* Android Screen Inner */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-[34px] overflow-hidden flex flex-col border border-slate-800/80">
          
          {/* Status Bar */}
          <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              {status === 'connected' && (
                <Key className="w-3 h-3 text-emerald-400 animate-pulse" />
              )}
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>

          {/* App Header (BanglaVpn33) */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-400">
                33
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Bangla VPN 33</h2>
                <span className="text-[10px] text-slate-500 block leading-none">v1.0.0 · WireGuard / OpenVPN</span>
              </div>
            </div>

            <button
              onClick={() => setIsServerDrawerOpen(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
              title="Select Server from assets"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-4 py-3 flex flex-col justify-between overflow-y-auto space-y-3">
            
            {/* Active Server Selector Card */}
            <button
              onClick={() => setIsServerDrawerOpen(true)}
              className="w-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all hover:border-slate-700 group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{selectedServer.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h4 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {selectedServer.country} ({selectedServer.city})
                    </h4>
                    {isServerBdixOptimized(selectedServer) && (
                      <BdixBadge variant="minimal" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {selectedServer.filename}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isServerBdixOptimized(selectedServer) && (
                  <span className="hidden sm:inline-block">
                    <BdixBadge variant="glow" />
                  </span>
                )}
                <span className="text-[10px] font-mono tabular-nums text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/60">
                  {selectedServer.ping}ms
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            </button>

            {/* Connection Sequence Animation & Pulsating Bridge */}
            <div className={`relative w-full rounded-2xl p-3 border transition-all duration-300 ${
              status === 'connected'
                ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                : status !== 'disconnected'
                ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-950/20'
                : 'bg-slate-950/70 border-slate-800/80'
            }`}>
              
              {/* Bridge Header */}
              <div className="flex items-center justify-between text-[10px] font-mono pb-2 border-b border-slate-800/60 mb-2.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity className={`w-3 h-3 ${status === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>Tunnel Bridge</span>
                </span>
                <span className={`px-1.5 py-0.2 rounded font-semibold ${
                  status === 'connected'
                    ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-900/80'
                    : status !== 'disconnected'
                    ? 'text-amber-400 bg-amber-950/70 border border-amber-900/80 animate-pulse'
                    : 'text-slate-500 bg-slate-900 border border-slate-800'
                }`}>
                  {status === 'connected' ? 'LOCKED' : status !== 'disconnected' ? 'NEGOTIATING' : 'IDLE'}
                </span>
              </div>

              {/* Pulsating Visual Bridge: Mobile Icon <===> Server Node */}
              <div className="flex items-center justify-between gap-1 relative py-1">
                
                {/* Left Node: Mobile Device */}
                <div className="flex flex-col items-center shrink-0 w-16">
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    status === 'connected'
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/20 shadow-emerald-500/30 shadow-md'
                      : status !== 'disconnected'
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}>
                    <Smartphone className="w-5 h-5" />
                    {status === 'connected' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 mt-1">Mobile</span>
                  <span className="text-[8px] font-mono text-slate-400 truncate max-w-[64px]" title={clientIp}>
                    {status === 'connected' ? '10.8.0.2' : clientIp}
                  </span>
                </div>

                {/* Center SVG Animated Pulsating Bridge */}
                <div className="flex-1 px-1 flex flex-col items-center justify-center relative min-w-[120px]">
                  
                  {/* SVG Bridge Conduit */}
                  <div className="w-full relative h-7 flex items-center justify-center">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 140 28">
                      <defs>
                        <linearGradient id="bridgeConnectedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="bridgeConnectingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Base Track */}
                      <path
                        d="M 6 14 C 40 14, 100 14, 134 14"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Animated Glowing Conduit when Connecting */}
                      {status !== 'disconnected' && status !== 'connected' && (
                        <>
                          <path
                            d="M 6 14 C 40 14, 100 14, 134 14"
                            fill="none"
                            stroke="url(#bridgeConnectingGrad)"
                            strokeWidth="3"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                            className="animate-dash-flow-fast"
                          />
                          {/* Pulsing Light Packet */}
                          <circle r="3.5" fill="#f59e0b" className="animate-ping-slow">
                            <animate
                              attributeName="cx"
                              values="10; 130; 10"
                              dur="1.2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              values="14; 14; 14"
                              dur="1.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      )}

                      {/* Active Laser Beam when Connected */}
                      {status === 'connected' && (
                        <>
                          {/* Outer Glow Line */}
                          <path
                            d="M 6 14 C 40 14, 100 14, 134 14"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="6"
                            strokeOpacity="0.25"
                            strokeLinecap="round"
                            className="animate-pulse"
                          />
                          {/* Inner Solid Beam */}
                          <path
                            d="M 6 14 C 40 14, 100 14, 134 14"
                            fill="none"
                            stroke="url(#bridgeConnectedGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="animate-laser-pulse"
                          />
                          {/* Bidirectional Fast Packets */}
                          <path
                            d="M 6 14 C 40 14, 100 14, 134 14"
                            fill="none"
                            stroke="#a7f3d0"
                            strokeWidth="2.5"
                            strokeDasharray="4 8"
                            strokeLinecap="round"
                            className="animate-dash-flow"
                          />
                          <circle r="2.5" fill="#ecfdf5">
                            <animate
                              attributeName="cx"
                              values="15; 125; 15"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="cy"
                              values="14; 14; 14"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      )}

                      {/* Dormant line when disconnected */}
                      {status === 'disconnected' && (
                        <path
                          d="M 6 14 C 40 14, 100 14, 134 14"
                          fill="none"
                          stroke="#334155"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>

                    {/* Central Tunnel Cipher / Shield Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] shadow-sm transition-all duration-300 ${
                        status === 'connected'
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-emerald-500/40 ring-2 ring-emerald-500/20'
                          : status !== 'disconnected'
                          ? 'bg-amber-950 border-amber-400 text-amber-300 animate-spin ring-2 ring-amber-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        {status === 'connected' ? (
                          <Lock className="w-3 h-3 text-emerald-400" />
                        ) : status !== 'disconnected' ? (
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Unlock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mid Bridge Status Label */}
                  <span className="text-[9px] font-mono mt-0.5 text-center truncate max-w-[110px]">
                    {status === 'connected' && (
                      <span className="text-emerald-400 font-semibold tracking-wide flex items-center justify-center gap-1">
                        {isServerBdixOptimized(selectedServer) ? (
                          <>
                            <Zap className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                            <span>BDIX 10G DIRECT</span>
                          </>
                        ) : (
                          <span>WireGuard 51820</span>
                        )}
                      </span>
                    )}
                    {status === 'connecting' && (
                      <span className="text-amber-400 font-medium">1/3 DNS Lookup</span>
                    )}
                    {status === 'authenticating' && (
                      <span className="text-amber-300 font-medium">2/3 TLS Handshake</span>
                    )}
                    {status === 'assigning_ip' && (
                      <span className="text-sky-300 font-medium">3/3 Virtual Route</span>
                    )}
                    {status === 'disconnected' && (
                      <span className="text-slate-500">Tunnel Dormant</span>
                    )}
                  </span>
                </div>

                {/* Right Node: Selected Server Node */}
                <div className="flex flex-col items-center shrink-0 w-16">
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    status === 'connected'
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/20 shadow-emerald-500/30 shadow-md'
                      : status !== 'disconnected'
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 ring-4 ring-amber-500/20'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}>
                    <span className="text-base">{selectedServer.flag}</span>
                    {isServerBdixOptimized(selectedServer) && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-sm border border-slate-950" title="BDIX Routing Optimized">
                        <Zap className="w-2 h-2 fill-slate-950" />
                      </span>
                    )}
                    {status === 'connected' && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 mt-1 truncate max-w-[64px]">
                    {selectedServer.city}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 truncate max-w-[64px]">
                    {isServerBdixOptimized(selectedServer) ? (
                      <span className="text-emerald-400 font-bold">BDIX ⚡</span>
                    ) : (
                      `:${selectedServer.port}`
                    )}
                  </span>
                </div>

              </div>

              {/* 4-Step Connection Sequence Progression Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                  
                  {/* Step 1: DNS */}
                  <div className={`px-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-0.5 ${
                    getStepStatus(1) === 'done'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                      : getStepStatus(1) === 'active'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse font-bold'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                  }`}>
                    {getStepStatus(1) === 'done' ? <Check className="w-2.5 h-2.5 shrink-0" /> : '1.'}
                    <span className="truncate">DNS</span>
                  </div>

                  {/* Step 2: Handshake */}
                  <div className={`px-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-0.5 ${
                    getStepStatus(2) === 'done'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                      : getStepStatus(2) === 'active'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse font-bold'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                  }`}>
                    {getStepStatus(2) === 'done' ? <Check className="w-2.5 h-2.5 shrink-0" /> : '2.'}
                    <span className="truncate">Auth</span>
                  </div>

                  {/* Step 3: Route */}
                  <div className={`px-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-0.5 ${
                    getStepStatus(3) === 'done'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                      : getStepStatus(3) === 'active'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse font-bold'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                  }`}>
                    {getStepStatus(3) === 'done' ? <Check className="w-2.5 h-2.5 shrink-0" /> : '3.'}
                    <span className="truncate">TUN</span>
                  </div>

                  {/* Step 4: Shielded */}
                  <div className={`px-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-0.5 ${
                    getStepStatus(4) === 'done'
                      ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400 shadow-xs'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                  }`}>
                    {getStepStatus(4) === 'done' ? <ShieldCheck className="w-2.5 h-2.5 shrink-0" /> : '4.'}
                    <span className="truncate">Cloaked</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Central Power Button Area */}
            <div className="flex flex-col items-center justify-center py-2">
              
              {/* Animated Glow rings */}
              <div className="relative flex items-center justify-center">
                {status === 'connected' && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
                    <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 blur-xl" />
                  </>
                )}

                {status !== 'disconnected' && status !== 'connected' && (
                  <div className="absolute w-32 h-32 rounded-full bg-amber-500/20 animate-pulse blur-lg" />
                )}

                {/* Big Power Button */}
                <button
                  onClick={handleToggleVpn}
                  className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                    status === 'connected'
                      ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 shadow-emerald-500/30 hover:brightness-105'
                      : status === 'disconnected'
                      ? 'bg-slate-900 border-2 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white shadow-slate-950'
                      : 'bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 animate-pulse'
                  }`}
                >
                  <Power className={`w-9 h-9 mb-1 transition-transform ${status === 'connected' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {status === 'connected' ? 'Connected' : status === 'disconnected' ? 'Tap to Connect' : 'Connecting'}
                  </span>
                </button>
              </div>

              {/* Status Text & Duration */}
              <div className="mt-3 text-center">
                <div className="text-xs font-medium text-slate-300">
                  {status === 'disconnected' && 'Not Connected'}
                  {status === 'connecting' && 'Step 1/3: Resolving Endpoint...'}
                  {status === 'authenticating' && 'Step 2/3: Key Exchange & Auth...'}
                  {status === 'assigning_ip' && 'Step 3/3: Routing Virtual IP...'}
                  {status === 'connected' && (
                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Secure Tunnel Active
                    </span>
                  )}
                </div>

                <div className="text-sm font-mono tabular-nums text-slate-400 mt-0.5">
                  {status === 'connected' ? formatDuration(stats.connectedDuration) : '00:00:00'}
                </div>
              </div>

            </div>

            {/* Bottom Traffic & IP Panel */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Download */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <ArrowDown className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] text-slate-400 block leading-none">Download</span>
                    <span className="text-xs font-mono font-semibold text-white tabular-nums">
                      {status === 'connected' ? (stats.downloadSpeed / 1024).toFixed(1) : '0.0'} MB/s
                    </span>
                  </div>
                </div>

                {/* Upload */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <ArrowUp className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] text-slate-400 block leading-none">Upload</span>
                    <span className="text-xs font-mono font-semibold text-white tabular-nums">
                      {status === 'connected' ? (stats.uploadSpeed / 1024).toFixed(1) : '0.0'} MB/s
                    </span>
                  </div>
                </div>
              </div>

              {/* D3 Real-Time Network Traffic Sparkline Area Chart */}
              <div className="pt-2 border-t border-slate-800/60">
                <NetworkTrafficChart status={status} compact={true} height={54} />
              </div>

              {/* Virtual IP & Cipher info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span className="flex items-center gap-1 truncate">
                  <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>IP: {status === 'connected' ? stats.assignedIp : clientIp}</span>
                </span>
                <span className="text-slate-500 truncate ml-2 flex items-center gap-1.5">
                  {isServerBdixOptimized(selectedServer) && (
                    <BdixBadge variant="minimal" />
                  )}
                  <span>{selectedServer.cipher}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="h-8 px-12 flex items-center justify-around border-t border-slate-800/40 bg-slate-950 shrink-0">
            <div className="w-3 h-3 border-l-2 border-b-2 border-slate-600 rotate-45" />
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600" />
            <div className="w-3 h-3 border-2 border-slate-600 rounded-sm" />
          </div>

          {/* Drawer / Server Selection Bottom Sheet */}
          {isServerDrawerOpen && (
            <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
              <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[82%] flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Server from Assets
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      app/src/main/assets/servers/ ({servers.length} files)
                    </p>
                  </div>
                  <button
                    onClick={() => setIsServerDrawerOpen(false)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Done
                  </button>
                </div>

                <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
                  {servers.map((server) => {
                    const isSelected = server.id === selectedServer.id;
                    return (
                      <button
                        key={server.id}
                        onClick={() => {
                          onSelectServer(server);
                          setIsServerDrawerOpen(false);
                          if (status === 'connected') {
                            // Reconnect with new server
                            setStatus('connecting');
                            setTimeout(() => setStatus('connected'), 1200);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{server.flag}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-white truncate">
                                {server.country} · {server.city}
                              </h4>
                              {isServerBdixOptimized(server) && (
                                <BdixBadge variant="minimal" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {server.filename}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isServerBdixOptimized(server) && (
                            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1 py-0.5 rounded flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                              <span className="hidden sm:inline">DIRECT</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-emerald-400 tabular-nums">
                            {server.ping}ms
                          </span>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Desktop Companion Inspector: Bridge Telemetry & Sequence Log */}
      <div className="w-full max-w-md lg:max-w-lg space-y-4">
        
        {/* D3 Real-Time Network Traffic & Handshake Monitor Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <NetworkTrafficChart status={status} compact={false} height={135} />
        </div>

        {/* Sequence Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Tunnel Sequence Telemetry
              </h3>
              {isServerBdixOptimized(selectedServer) && (
                <BdixBadge variant="glow" />
              )}
            </div>
            <button
              onClick={handleToggleVpn}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                status === 'connected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {status === 'connected' ? 'Simulate Disconnect' : 'Trigger Handshake'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Visualizes the live encrypted bridge created between the Android device (<code className="text-emerald-300 font-mono">{clientIp}</code>) and the selected node (<code className="text-emerald-300 font-mono">{selectedServer.filename}</code>).
            {isServerBdixOptimized(selectedServer) && (
              <span className="block mt-1 text-emerald-400 font-mono text-[11px] font-semibold">
                ⚡ BDIX Routing Optimization Active: Domestic Bangladesh Internet Exchange direct peering enabled (sub-10ms domestic route).
              </span>
            )}
          </p>

          {/* Detailed Sequence Stepper Matrix */}
          <div className="space-y-2.5">
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              getStepStatus(1) === 'done'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : getStepStatus(1) === 'active'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 animate-pulse'
                : 'bg-slate-950 border-slate-800/70 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-slate-800/80">
                  {getStepStatus(1) === 'done' ? '✓' : '1'}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">DNS Resolution & Endpoint Query</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Querying {selectedServer.host} via 1.1.1.1
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono tabular-nums">
                {getStepStatus(1) === 'done' ? 'OK' : getStepStatus(1) === 'active' ? 'Resolving...' : 'Standby'}
              </span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              getStepStatus(2) === 'done'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : getStepStatus(2) === 'active'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 animate-pulse'
                : 'bg-slate-950 border-slate-800/70 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-slate-800/80">
                  {getStepStatus(2) === 'done' ? '✓' : '2'}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">Curve25519 / TLS Key Exchange</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    UDP Port {selectedServer.port} · {selectedServer.cipher}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono tabular-nums">
                {getStepStatus(2) === 'done' ? 'Authenticated' : getStepStatus(2) === 'active' ? 'Exchange...' : 'Standby'}
              </span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              getStepStatus(3) === 'done'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : getStepStatus(3) === 'active'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 animate-pulse'
                : 'bg-slate-950 border-slate-800/70 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-slate-800/80">
                  {getStepStatus(3) === 'done' ? '✓' : '3'}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">TUN Interface & Virtual Route Injection</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Allocated TUN: {stats.assignedIp} · Default Gateway Replaced
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono tabular-nums">
                {getStepStatus(3) === 'done' ? 'Routed' : getStepStatus(3) === 'active' ? 'Routing...' : 'Standby'}
              </span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              getStepStatus(4) === 'done'
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800/70 text-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-slate-800/80">
                  {getStepStatus(4) === 'done' ? '✓' : '4'}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white">Full IP Masking & Encrypted Payload</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Traffic egressing via {selectedServer.city} ({selectedServer.ping}ms)
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono tabular-nums">
                {getStepStatus(4) === 'done' ? 'PROTECTED' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Packet & Transition Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 mb-2.5">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Android VpnService Event Stream</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Console</span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {sequenceLogs.length === 0 ? (
              <div className="text-slate-600 italic">No events yet. Tap Connect to begin sequence.</div>
            ) : (
              sequenceLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-tight">
                  <span className="text-slate-600 shrink-0 text-[10px]">{log.time}</span>
                  <span className={`text-[11px] ${
                    log.type === 'success'
                      ? 'text-emerald-400 font-medium'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}>
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
