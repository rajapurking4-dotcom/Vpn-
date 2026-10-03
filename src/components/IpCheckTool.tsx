import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCw, 
  Check, 
  Copy, 
  ExternalLink, 
  Wifi, 
  Server, 
  Eye, 
  Lock,
  Smartphone,
  Code,
  Terminal,
  Activity
} from 'lucide-react';
import { ServerConfig, VpnConnectionStatus } from '../types/vpn';

interface IpCheckToolProps {
  vpnStatus: VpnConnectionStatus;
  selectedServer: ServerConfig;
  onOpenSimulator: () => void;
}

export const IpCheckTool: React.FC<IpCheckToolProps> = ({
  vpnStatus,
  selectedServer,
  onOpenSimulator,
}) => {
  const [realIp, setRealIp] = useState<string>('82.167.7.208');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('Just now');
  const [format, setFormat] = useState<'text' | 'json' | 'jsonp' | 'ipv6'>('json');
  const [latencyMs, setLatencyMs] = useState<number>(24);

  const fetchRealIp = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (res.ok) {
        const data = await res.json();
        setRealIp(data.ip || '82.167.7.208');
      } else {
        setRealIp('82.167.7.208');
      }
    } catch (e) {
      setRealIp('82.167.7.208');
    } finally {
      const end = performance.now();
      setLatencyMs(Math.max(12, Math.round(end - start)));
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchRealIp();
  }, []);

  const isConnected = vpnStatus === 'connected';
  const displayIp = isConnected ? selectedServer.host : realIp;
  const displayLocation = isConnected 
    ? `${selectedServer.country} (${selectedServer.city})`
    : 'Local ISP Connection (Dhaka, Bangladesh)';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getFormatOutput = () => {
    switch (format) {
      case 'text':
        return displayIp;
      case 'json':
        return JSON.stringify({ ip: displayIp }, null, 2);
      case 'jsonp':
        return `getIP(${JSON.stringify({ ip: displayIp })});`;
      case 'ipv6':
        return JSON.stringify({ ip: displayIp, type: 'IPv4/IPv6 Dual-Stack' }, null, 2);
    }
  };

  const getEndpointUrl = () => {
    switch (format) {
      case 'text':
        return 'https://api.ipify.org';
      case 'json':
        return 'https://api.ipify.org?format=json';
      case 'jsonp':
        return 'https://api.ipify.org?format=jsonp&callback=getIP';
      case 'ipv6':
        return 'https://api64.ipify.org?format=json';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Path Breadcrumb & Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Globe className="w-4 h-4" />
            <span>Public IP Discovery & Tunnel Validation Service</span>
            <span className="text-slate-500">·</span>
            <a 
              href="https://api.ipify.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-300 font-mono underline flex items-center gap-1 inline-flex"
            >
              <span>https://api.ipify.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono tracking-tight">
            api.ipify.org Integration
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Used by <code className="text-emerald-300 font-mono">wireguard-server-setup.sh</code> to automatically detect your server's public endpoint and configure client profiles in <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRealIp}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{loading ? 'Querying api.ipify.org...' : 'Re-check IP'}</span>
          </button>

          <a
            href="https://api.ipify.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <span>Visit api.ipify.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main IP Status Display Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isConnected ? selectedServer.flag : '🌐'}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {isConnected ? 'BanglaVPN Virtual Endpoint (Masked)' : 'Current Public IP (Exposed)'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                  isConnected
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/70 border border-amber-800 text-amber-300'
                }`}>
                  {isConnected ? 'PROTECTED' : 'UNENCRYPTED'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5">
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight select-all">
                  {displayIp}
                </h2>
                <button
                  onClick={() => handleCopy(displayIp, 'hero-ip')}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
                  title="Copy IP"
                >
                  {copied === 'hero-ip' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                <span>Location: <strong className="text-slate-200">{displayLocation}</strong></span>
                <span>·</span>
                <span>Endpoint: <a href="https://api.ipify.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono hover:underline">api.ipify.org</a></span>
                <span>·</span>
                <span>Response Time: <strong className="text-emerald-400 font-mono">{latencyMs} ms</strong></span>
              </div>
            </div>
          </div>

          {/* Quick simulator toggle */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={onOpenSimulator}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isConnected ? 'Manage Active VPN Tunnel' : 'Connect & Mask IP in Simulator'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Interactive API Format Playground */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>api.ipify.org Output Formats & Endpoints</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an output format to inspect the live response structure from api.ipify.org.
            </p>
          </div>

          {/* Format pills */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1 rounded transition-colors ${format === 'json' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              JSON
            </button>
            <button
              onClick={() => setFormat('text')}
              className={`px-3 py-1 rounded transition-colors ${format === 'text' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Plain Text
            </button>
            <button
              onClick={() => setFormat('jsonp')}
              className={`px-3 py-1 rounded transition-colors ${format === 'jsonp' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              JSONP
            </button>
            <button
              onClick={() => setFormat('ipv6')}
              className={`px-3 py-1 rounded transition-colors ${format === 'ipv6' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              IPv6 / Dual-Stack
            </button>
          </div>
        </div>

        {/* Live Code Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
            <span className="text-emerald-400 font-mono truncate">{getEndpointUrl()}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(getFormatOutput(), 'format-copy')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copied === 'format-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied === 'format-copy' ? 'Copied' : 'Copy Response'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre">
            <code>{getFormatOutput()}</code>
          </pre>
        </div>
      </div>

      {/* Deep Dive Grid: How api.ipify.org is Used */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: VPS Setup Script Role */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Server className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
              1. VPS Endpoint Auto-Discovery
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In <code className="text-emerald-300 font-mono">wireguard-server-setup.sh</code>, the server queries <code className="text-emerald-300 font-mono">api.ipify.org</code> to automatically identify its public IPv4 address without manual user input:
          </p>

          <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`SERVER_PUB_IP=$(curl -s https://api.ipify.org || curl -s https://ifconfig.me)

# Injected directly into client profiles:
Endpoint = \${SERVER_PUB_IP}:51820`}
          </pre>

          <p className="text-[11px] text-slate-400">
            This ensures that every client <code className="font-mono text-slate-300">.conf</code> generated for <code className="font-mono text-emerald-400">app/src/main/assets/servers/</code> points directly to the server's live public IP.
          </p>
        </div>

        {/* Card 2: Leak Test & Verification Role */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
              2. Client Leak & Masking Verification
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            When users connect in the Android app (or mobile simulator), <code className="text-sky-300 font-mono">api.ipify.org</code> is called by the client to verify that your real IP address is hidden:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Before VPN:</span>
              <span className="text-amber-400 font-bold">{realIp} (ISP Exposed)</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">After VPN:</span>
              <span className="text-emerald-400 font-bold">{selectedServer.host} (Masked)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            All DNS queries and HTTP/HTTPS packets exit through the WireGuard interface (<code className="font-mono text-slate-300">wg0</code>) or OpenVPN (<code className="font-mono text-slate-300">tun0</code>).
          </p>
        </div>

      </div>

    </div>
  );
};
