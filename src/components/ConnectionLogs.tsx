import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCw, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  ShieldCheck, 
  Zap, 
  Radio, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Pause, 
  Activity,
  Globe,
  RefreshCw,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { ServerConfig, VpnConnectionStatus, VpnStats } from '../types/vpn';
import { BdixBadge } from './BdixBadge';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'handshake' | 'routing' | 'packet' | 'warn' | 'success';
  tag: 'CORE' | 'CRYPTO' | 'ROUTE' | 'TUN0' | 'BDIX' | 'PACKET';
  message: string;
  details?: string;
}

interface ConnectionLogsProps {
  selectedServer: ServerConfig;
  servers: ServerConfig[];
  onSelectServer: (server: ServerConfig) => void;
  status: VpnConnectionStatus;
  onToggleConnection: () => void;
  stats: VpnStats;
}

export const ConnectionLogs: React.FC<ConnectionLogsProps> = ({
  selectedServer,
  servers,
  onSelectServer,
  status,
  onToggleConnection,
  stats,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'all' | 'handshake' | 'routing' | 'packet' | 'warn'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [simulatedPings, setSimulatedPings] = useState(0);
  const [packetCount, setPacketCount] = useState(142);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  // Generate initial bootstrap logs
  useEffect(() => {
    const initLogs: LogEntry[] = [
      {
        id: 'boot-1',
        timestamp: getTimestamp(),
        level: 'info',
        tag: 'CORE',
        message: 'Android Debug Bridge / Android 14 (API 34) Runtime initialized',
        details: 'com.banglavpn33.vpn [pid: 15124, uid: 10244]'
      },
      {
        id: 'boot-2',
        timestamp: getTimestamp(),
        level: 'info',
        tag: 'CORE',
        message: `Bound profile: assets/servers/${selectedServer.filename}`,
        details: `Country: ${selectedServer.country} (${selectedServer.city}), Cipher: ${selectedServer.cipher}`
      },
      {
        id: 'boot-3',
        timestamp: getTimestamp(),
        level: 'routing',
        tag: 'ROUTE',
        message: `Socket endpoint resolved: ${selectedServer.host}:${selectedServer.port} (${selectedServer.protocol.toUpperCase()})`,
        details: `Default gateway: 192.168.1.1 dev wlan0 metric 100`
      },
      {
        id: 'boot-4',
        timestamp: getTimestamp(),
        level: 'info',
        tag: 'TUN0',
        message: 'BanglaVpnService standby. Ready for user connection request.',
      }
    ];

    if (status === 'connected') {
      initLogs.push(
        {
          id: 'boot-conn-1',
          timestamp: getTimestamp(),
          level: 'handshake',
          tag: 'CRYPTO',
          message: 'WireGuard / TLS Curve25519 Handshake Completed with remote peer',
          details: 'Session Key: 0x9a4f...31bc, Ephemeral ECDH exchange successful'
        },
        {
          id: 'boot-conn-2',
          timestamp: getTimestamp(),
          level: 'routing',
          tag: 'TUN0',
          message: `Interface tun0 active (IP: ${stats.assignedIp}/32, MTU: 1500)`,
          details: `Route 0.0.0.0/0 dev tun0 installed`
        },
        {
          id: 'boot-conn-3',
          timestamp: getTimestamp(),
          level: 'success',
          tag: 'CORE',
          message: `✓ Encrypted tunnel active to ${selectedServer.country} (${selectedServer.city})`,
        }
      );
    }

    setLogs(initLogs);
  }, [selectedServer.id]);

  // Log status transitions
  useEffect(() => {
    const ts = getTimestamp();

    if (status === 'connecting') {
      const step1: LogEntry = {
        id: `conn-init-${Date.now()}`,
        timestamp: ts,
        level: 'info',
        tag: 'CORE',
        message: `[ACTION_CONNECT] Starting VPN handshake with ${selectedServer.host}:${selectedServer.port}`,
        details: `Protocol: ${selectedServer.protocol.toUpperCase()} | Cipher: ${selectedServer.cipher}`
      };

      const step2: LogEntry = {
        id: `conn-dns-${Date.now() + 1}`,
        timestamp: ts,
        level: 'routing',
        tag: 'ROUTE',
        message: `Querying upstream DNS for ${selectedServer.host}... A record: 103.134.58.109`,
        details: 'Lookup latency: 12ms via system resolver'
      };

      setLogs((prev) => [...prev, step1, step2]);

    } else if (status === 'authenticating') {
      const stepCrypto1: LogEntry = {
        id: `auth-init-${Date.now()}`,
        timestamp: ts,
        level: 'handshake',
        tag: 'CRYPTO',
        message: 'Generating Ephemeral Curve25519 Keypair (Public: 0x7c21...8b42)',
        details: 'Quantum-Resistant Pre-Shared Key (PSK) auth enabled'
      };

      const stepCrypto2: LogEntry = {
        id: `auth-mac-${Date.now() + 1}`,
        timestamp: ts,
        level: 'handshake',
        tag: 'CRYPTO',
        message: `Initiation packet sent to ${selectedServer.host} (148 bytes, MAC1/MAC2 OK)`,
      };

      const stepCrypto3: LogEntry = {
        id: `auth-resp-${Date.now() + 2}`,
        timestamp: ts,
        level: 'handshake',
        tag: 'CRYPTO',
        message: `Received Handshake Response from server in ${selectedServer.ping}ms`,
        details: `Negotiated AEAD cipher: ${selectedServer.cipher}`
      };

      setLogs((prev) => [...prev, stepCrypto1, stepCrypto2, stepCrypto3]);

    } else if (status === 'assigning_ip') {
      const stepTun1: LogEntry = {
        id: `tun-build-${Date.now()}`,
        timestamp: ts,
        level: 'routing',
        tag: 'TUN0',
        message: 'VpnService.Builder().setSession("BanglaVPN 33").establish() invoked',
        details: 'Virtual TUN device instantiated (FileDescriptor 42, MTU: 1500)'
      };

      const stepTun2: LogEntry = {
        id: `tun-addr-${Date.now() + 1}`,
        timestamp: ts,
        level: 'routing',
        tag: 'ROUTE',
        message: `Assigned IPv4 endpoint address: ${stats.assignedIp}/32`,
      };

      const stepRoute: LogEntry = {
        id: `tun-route-${Date.now() + 2}`,
        timestamp: ts,
        level: 'routing',
        tag: 'ROUTE',
        message: 'Redirecting default gateway: 0.0.0.0/0 via tun0 (metric 50)',
        details: `Direct route preserved: ${selectedServer.host}/32 via wlan0 metric 1`
      };

      const logEntries = [stepTun1, stepTun2, stepRoute];

      if (selectedServer.isBdixOptimized || selectedServer.countryCode === 'BD') {
        logEntries.push({
          id: `bdix-opt-${Date.now() + 3}`,
          timestamp: ts,
          level: 'success',
          tag: 'BDIX',
          message: 'Local BDIX peering optimization rules injected!',
          details: 'Direct zero-hop routing for BDIX ASNs: 103.134.58.0/24, 114.130.0.0/16, 182.160.96.0/20'
        });
      }

      setLogs((prev) => [...prev, ...logEntries]);

    } else if (status === 'connected') {
      const stepSuccess: LogEntry = {
        id: `conn-ok-${Date.now()}`,
        timestamp: ts,
        level: 'success',
        tag: 'CORE',
        message: `✓ Handshake established! Connected to ${selectedServer.country} (${selectedServer.city})`,
        details: `Assigned IP: ${stats.assignedIp} | Latency: ${selectedServer.ping}ms | MTU: 1500`
      };

      const stepDns: LogEntry = {
        id: `dns-ok-${Date.now() + 1}`,
        timestamp: ts,
        level: 'routing',
        tag: 'ROUTE',
        message: 'DNS Secure Forwarder activated: 1.1.1.1, 103.134.58.18 (Anti-DNS leak active)',
      };

      setLogs((prev) => [...prev, stepSuccess, stepDns]);

    } else if (status === 'disconnected') {
      const stepDown: LogEntry = {
        id: `disc-${Date.now()}`,
        timestamp: ts,
        level: 'warn',
        tag: 'CORE',
        message: '[ACTION_DISCONNECT] Tearing down VPN interface tun0',
      };

      const stepFlushed: LogEntry = {
        id: `flush-${Date.now() + 1}`,
        timestamp: ts,
        level: 'routing',
        tag: 'ROUTE',
        message: 'Flushed 0.0.0.0/0 route from tun0. Restored default physical gateway',
        details: 'Default gateway 192.168.1.1 via wlan0 restored'
      };

      const stepClosed: LogEntry = {
        id: `close-${Date.now() + 2}`,
        timestamp: ts,
        level: 'info',
        tag: 'TUN0',
        message: 'ParcelFileDescriptor closed. Memory & crypto keys safely zeroized.',
      };

      setLogs((prev) => [...prev, stepDown, stepFlushed, stepClosed]);
    }
  }, [status]);

  // Periodic simulated packet streaming when connected
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      setPacketCount((p) => p + 1);
      const ts = getTimestamp();
      const isTx = Math.random() > 0.4;
      const bytes = Math.floor(Math.random() * 950) + 64;
      const seq = Math.floor(Math.random() * 90000) + 10000;

      const packetLog: LogEntry = {
        id: `pkt-${Date.now()}`,
        timestamp: ts,
        level: 'packet',
        tag: 'PACKET',
        message: isTx
          ? `TX tun0 -> ${selectedServer.host}: proto=UDP len=${bytes} seq=${seq} cipher=${selectedServer.cipher}`
          : `RX tun0 <- ${selectedServer.host}: proto=UDP len=${bytes} seq=${seq} ok [${stats.ping}ms]`,
      };

      setLogs((prev) => [...prev.slice(-120), packetLog]);
    }, 2800);

    return () => clearInterval(interval);
  }, [status, selectedServer.host, selectedServer.cipher, stats.ping]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handlers
  const handleClearLogs = () => {
    setLogs([
      {
        id: 'cleared-1',
        timestamp: getTimestamp(),
        level: 'info',
        tag: 'CORE',
        message: 'Terminal logs buffer cleared by user',
      }
    ]);
  };

  const handleCopyLogs = () => {
    const raw = logs
      .map((l) => `[${l.timestamp}] [${l.tag}] ${l.message}${l.details ? ` (${l.details})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const raw = [
      `# BanglaVPN 33 - Realtime Connection Diagnostic Log`,
      `# Server: ${selectedServer.country} (${selectedServer.city})`,
      `# Host: ${selectedServer.host}:${selectedServer.port} (${selectedServer.protocol.toUpperCase()})`,
      `# Profile: assets/servers/${selectedServer.filename}`,
      `# Date: ${new Date().toISOString()}`,
      `# Status: ${status}`,
      `# -------------------------------------------------------------`,
      ...logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.tag}] ${l.message}${l.details ? ` -- ${l.details}` : ''}`)
    ].join('\n');

    const blob = new Blob([raw], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `banglavpn-log-${selectedServer.countryCode.toLowerCase()}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendPing = () => {
    const ts = getTimestamp();
    const seq = simulatedPings + 1;
    setSimulatedPings(seq);

    const pingReq: LogEntry = {
      id: `ping-req-${Date.now()}`,
      timestamp: ts,
      level: 'packet',
      tag: 'PACKET',
      message: `ICMP echo request -> ${selectedServer.host}: icmp_seq=${seq} ttl=64 size=64 bytes`,
    };

    setLogs((prev) => [...prev, pingReq]);

    setTimeout(() => {
      const respTs = getTimestamp();
      const jitter = (Math.random() * 4 - 2).toFixed(1);
      const measuredRtt = Math.max(8, (selectedServer.ping + parseFloat(jitter))).toFixed(1);

      const pingResp: LogEntry = {
        id: `ping-resp-${Date.now()}`,
        timestamp: respTs,
        level: 'success',
        tag: 'ROUTE',
        message: `64 bytes from ${selectedServer.host}: icmp_seq=${seq} ttl=58 time=${measuredRtt} ms`,
      };

      setLogs((prev) => [...prev, pingResp]);
    }, Math.min(selectedServer.ping, 180));
  };

  const handleSimulateRekey = () => {
    const ts = getTimestamp();
    const rekeyInit: LogEntry = {
      id: `rekey-init-${Date.now()}`,
      timestamp: ts,
      level: 'handshake',
      tag: 'CRYPTO',
      message: 'Cryptographic Rekey initiated (Timer: 3600s or 1GB rekey boundary reached)',
      details: 'Generating new Curve25519 ephemeral key'
    };

    setLogs((prev) => [...prev, rekeyInit]);

    setTimeout(() => {
      const rekeyOk: LogEntry = {
        id: `rekey-ok-${Date.now()}`,
        timestamp: getTimestamp(),
        level: 'success',
        tag: 'CRYPTO',
        message: '✓ Rekey Handshake Complete! Ratcheted to new forward-secret session key (0x81e2...f34a)',
        details: 'Seamless zero-downtime key rotation on tun0'
      };
      setLogs((prev) => [...prev, rekeyOk]);
    }, 450);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'handshake' && log.level !== 'handshake') return false;
    if (filterLevel === 'routing' && log.level !== 'routing' && log.tag !== 'ROUTE' && log.tag !== 'TUN0') return false;
    if (filterLevel === 'packet' && log.level !== 'packet') return false;
    if (filterLevel === 'warn' && log.level !== 'warn') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.message.toLowerCase().includes(q) ||
        log.tag.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Server Target Spotlight */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Terminal className="w-4 h-4" />
            <span>Real-time Connection Logs</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Android VPN Engine</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-semibold">tun0 Subsystem</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Handshake & Routing Diagnostic Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live stream of cryptographic handshakes, packet encapsulation, TUN routing table changes, and BDIX peering events for <code className="text-emerald-300 font-mono">{selectedServer.filename}</code>.
          </p>
        </div>

        {/* Top Controls: Target Server Selector & Connect Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Server Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <span>{selectedServer.flag}</span>
              <span className="font-semibold">{selectedServer.country}</span>
              <span className="text-slate-400 font-mono text-[11px]">({selectedServer.city})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isServerDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                <div className="p-2.5 bg-slate-950 text-[11px] font-mono text-slate-400">
                  Select Server to Monitor:
                </div>
                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                  {servers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectServer(s);
                        setIsServerDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        s.id === selectedServer.id
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{s.flag}</span>
                        <span className="truncate">{s.country}</span>
                        <span className="text-slate-500 text-[11px] truncate">{s.city}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">{s.ping}ms</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Connection Toggle Button */}
          <button
            onClick={onToggleConnection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              status === 'connected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : status === 'connecting' || status === 'authenticating' || status === 'assigning_ip'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {status === 'connected' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Disconnect VPN</span>
              </>
            ) : status === 'connecting' || status === 'authenticating' || status === 'assigning_ip' ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Handshaking...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initiate Handshake</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* State & Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">Tunnel State</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : status === 'disconnected'
                  ? 'bg-slate-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <strong className="text-white capitalize">{status.replace('_', ' ')}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">Interface</span>
          <strong className="text-emerald-400 mt-1 block">
            tun0 {status === 'connected' ? '(UP)' : '(STANDBY)'}
          </strong>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">Assigned IP</span>
          <strong className="text-white mt-1 block truncate">
            {status === 'connected' ? `${stats.assignedIp}/32` : 'None (0.0.0.0)'}
          </strong>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">Cipher / Key</span>
          <strong className="text-sky-400 mt-1 block truncate">
            {selectedServer.cipher}
          </strong>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">RTT / Ping</span>
          <strong className="text-amber-400 mt-1 block">
            {selectedServer.ping} ms
          </strong>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <span className="text-slate-500 text-[10px] block uppercase">BDIX Status</span>
          <div className="mt-1">
            {selectedServer.isBdixOptimized || selectedServer.countryCode === 'BD' ? (
              <span className="text-emerald-400 font-bold">PEERED (Direct)</span>
            ) : (
              <span className="text-slate-400">Transit</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Terminal Window Header Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Window Buttons & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <span className="font-mono text-slate-300 font-medium flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>BanglaVpnService — tun0 live logger</span>
              <span className="text-slate-500 text-[11px]">[{filteredLogs.length} events]</span>
            </span>
          </div>

          {/* Quick Filter Chips & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Buttons */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterLevel === 'all' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLevel('handshake')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterLevel === 'handshake' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setFilterLevel('routing')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterLevel === 'routing' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Routing
              </button>
              <button
                onClick={() => setFilterLevel('packet')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterLevel === 'packet' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Packets
              </button>
            </div>

            {/* AutoScroll Toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                autoScroll
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
              title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is PAUSED'}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>

            {/* Clear */}
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear terminal buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy */}
            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy all logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Download */}
            <button
              onClick={handleDownloadLogs}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Download diagnostic log file"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

        </div>

        {/* Search bar inside terminal */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-900 flex items-center gap-2 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search / filter logs by keyword (e.g. handshake, BDIX, tun0, seq)..."
            className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-slate-500 hover:text-slate-300 font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Terminal Output Scroll Box */}
        <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed max-h-[480px] overflow-y-auto space-y-1.5 bg-slate-950">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No log events match the current filter or search criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let tagColor = 'text-slate-400 bg-slate-900 border-slate-800';
              let textColor = 'text-slate-300';

              if (log.tag === 'CRYPTO') {
                tagColor = 'text-purple-400 bg-purple-950/60 border-purple-800/80';
                textColor = 'text-purple-200';
              } else if (log.tag === 'ROUTE') {
                tagColor = 'text-sky-400 bg-sky-950/60 border-sky-800/80';
                textColor = 'text-sky-200';
              } else if (log.tag === 'TUN0') {
                tagColor = 'text-amber-400 bg-amber-950/60 border-amber-800/80';
                textColor = 'text-amber-200';
              } else if (log.tag === 'BDIX') {
                tagColor = 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
                textColor = 'text-emerald-300 font-semibold';
              } else if (log.tag === 'PACKET') {
                tagColor = 'text-slate-500 bg-slate-900 border-slate-800';
                textColor = 'text-slate-400';
              }

              if (log.level === 'success') {
                textColor = 'text-emerald-400 font-bold';
              } else if (log.level === 'warn') {
                textColor = 'text-rose-400 font-medium';
              }

              return (
                <div key={log.id} className="flex items-start gap-2.5 py-0.5 hover:bg-slate-900/40 rounded px-1 -mx-1 transition-colors">
                  <span className="text-slate-600 select-none shrink-0 text-[11px] pt-0.5">
                    {log.timestamp}
                  </span>

                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border shrink-0 ${tagColor}`}>
                    {log.tag}
                  </span>

                  <div className="flex-1 break-words">
                    <span className={textColor}>{log.message}</span>
                    {log.details && (
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        ↳ {log.details}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Interactive Action Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Inject Test Traffic:</span>
            
            <button
              onClick={handleSendPing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Ping {selectedServer.host.split('.')[0]}</span>
            </button>

            <button
              onClick={handleSimulateRekey}
              disabled={status !== 'connected'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors disabled:opacity-40"
            >
              <RotateCw className="w-3 h-3 text-purple-400" />
              <span>Trigger Rekey</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Active Asset:</span>
            <code className="text-emerald-300 font-semibold">{selectedServer.filename}</code>
          </div>
        </div>

      </div>

      {/* Deep-Dive Inspection Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        
        {/* Handshake Sequence Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Handshake Protocol</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
            Executes 1-RTT Noise protocol handshake with ephemeral Curve25519 diffie-hellman and PSK symmetric keys. Authenticates peer and negotiates forward secrecy.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px]">
            Initiation (148B) ➔ Response (92B) ➔ Session Cookie (64B)
          </div>
        </div>

        {/* Packet Routing & TUN interface */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>2. Kernel tun0 Routing</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
            Builds virtual IP network adapter with MTU 1500. Directs all outbound IP datagrams into the encrypted tunnel while protecting local broadcast subnets.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px]">
            ip route add default dev tun0 metric 50 table 51820
          </div>
        </div>

        {/* BDIX Direct Optimization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Globe className="w-4 h-4" />
            <span>3. BDIX Peering Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
            When connecting to Bangladesh nodes, direct peering routes are injected for Dhaka IX, AmberIT, Carnival, and Link3, bypassing high-latency international transit.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px]">
            BDIX Route Table: 103.134.58.0/24 (0-hop direct IX)
          </div>
        </div>

      </div>

    </div>
  );
};
