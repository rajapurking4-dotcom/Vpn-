import React, { useState } from 'react';
import { 
  Activity, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Wifi, 
  Zap,
  Globe2
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';

interface ServerHealthProbeProps {
  servers: ServerConfig[];
  onSelectServer: (server: ServerConfig) => void;
  onOpenSimulator: (server: ServerConfig) => void;
}

export const ServerHealthProbe: React.FC<ServerHealthProbeProps> = ({
  servers,
  onSelectServer,
  onOpenSimulator,
}) => {
  const [probing, setProbing] = useState(false);
  const [probeResults, setProbeResults] = useState<Record<string, {
    ping: number;
    jitter: number;
    packetLoss: number;
    dnsStatus: 'OK' | 'Slow';
    status: 'optimal' | 'good' | 'degraded';
  }>>({});

  const handleRunProbe = () => {
    setProbing(true);
    setTimeout(() => {
      const results: typeof probeResults = {};
      servers.forEach((s) => {
        // Base ping on geographic region with slight jitter
        const jitter = Math.floor(Math.random() * 6) + 1;
        const newPing = Math.max(8, s.ping + Math.floor(Math.random() * 10) - 5);
        results[s.id] = {
          ping: newPing,
          jitter,
          packetLoss: 0,
          dnsStatus: 'OK',
          status: newPing < 45 ? 'optimal' : newPing < 120 ? 'good' : 'degraded',
        };
      });
      setProbeResults(results);
      setProbing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Activity className="w-4 h-4" />
            <span>BanglaVPN Network Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Server Latency & Routing Probe
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Simulate ICMP ping probes, MTU handshakes, and UDP packet loss across all servers loaded from <code className="text-emerald-300 font-mono">app/src/main/assets/servers</code>.
          </p>
        </div>

        <button
          onClick={handleRunProbe}
          disabled={probing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          <RotateCw className={`w-4 h-4 ${probing ? 'animate-spin' : ''}`} />
          <span>{probing ? 'Probing Nodes...' : 'Probe All Servers'}</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Node / Location</th>
                <th className="py-3 px-4 font-medium">Remote Endpoint</th>
                <th className="py-3 px-4 font-medium">Protocol</th>
                <th className="py-3 px-4 font-medium">Latency</th>
                <th className="py-3 px-4 font-medium">Jitter</th>
                <th className="py-3 px-4 font-medium">Packet Loss</th>
                <th className="py-3 px-4 font-medium">DNS Health</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {servers.map((server) => {
                const res = probeResults[server.id];
                const displayPing = res ? res.ping : server.ping;
                const displayStatus = res ? res.status : displayPing < 45 ? 'optimal' : displayPing < 120 ? 'good' : 'degraded';

                return (
                  <tr key={server.id} className="hover:bg-slate-850/60 transition-colors">
                    
                    {/* Node / Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{server.flag}</span>
                        <div>
                          <span className="font-semibold text-white block">
                            {server.country}
                          </span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {server.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Remote Endpoint */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>{server.host}</div>
                      <div className="text-[10px] text-slate-500">Port {server.port}</div>
                    </td>

                    {/* Protocol */}
                    <td className="py-3 px-4 font-mono uppercase text-slate-400">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                        {server.protocol}
                      </span>
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          displayStatus === 'optimal'
                            ? 'bg-emerald-400'
                            : displayStatus === 'good'
                            ? 'bg-sky-400'
                            : 'bg-amber-400'
                        }`} />
                        <span className="font-semibold text-white text-xs">
                          {displayPing} ms
                        </span>
                      </div>
                    </td>

                    {/* Jitter */}
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                      ±{res ? res.jitter : 2} ms
                    </td>

                    {/* Packet Loss */}
                    <td className="py-3 px-4 font-mono tabular-nums text-emerald-400">
                      0.0%
                    </td>

                    {/* DNS Health */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectServer(server);
                          onOpenSimulator(server);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 rounded-lg transition-colors"
                      >
                        Launch
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
