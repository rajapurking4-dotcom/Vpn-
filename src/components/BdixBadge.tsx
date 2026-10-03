import React from 'react';
import { Zap, Network } from 'lucide-react';
import { ServerConfig } from '../types/vpn';

export const isServerBdixOptimized = (server?: ServerConfig | null): boolean => {
  if (!server) return false;
  return Boolean(
    server.isBdixOptimized ||
    server.category === 'BDIX' ||
    server.filename.toLowerCase().includes('bdix') ||
    server.country.toLowerCase().includes('bangladesh') ||
    server.city.toLowerCase().includes('dhaka') ||
    server.rawConfig?.toLowerCase().includes('bdix')
  );
};

interface BdixBadgeProps {
  size?: 'xs' | 'sm' | 'md';
  variant?: 'pill' | 'glow' | 'minimal' | 'full';
  className?: string;
}

export const BdixBadge: React.FC<BdixBadgeProps> = ({
  size = 'sm',
  variant = 'pill',
  className = '',
}) => {
  if (variant === 'minimal') {
    return (
      <span
        title="BDIX Routing Optimized (Bangladesh Internet Exchange direct peer)"
        className={`inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 text-[9px] ${className}`}
      >
        <Zap className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400 shrink-0 animate-pulse" />
        <span>BDIX</span>
      </span>
    );
  }

  if (variant === 'glow') {
    return (
      <span
        title="BDIX Routing Optimized - Direct 10Gbps Peering with local Bangladesh ISPs & Content Caches"
        className={`inline-flex items-center gap-1.5 font-mono font-semibold text-emerald-300 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/80 px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-xs shadow-emerald-500/20 text-[10px] ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
        <span className="tracking-wide">BDIX ROUTED</span>
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <span
        title="BDIX Routing Optimized: Local IX peering bypasses international gateways for sub-10ms domestic latency"
        className={`inline-flex items-center gap-1.5 font-mono font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-500/60 shadow-sm shadow-emerald-950/40 text-xs ${className}`}
      >
        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0 animate-pulse" />
        <span>BDIX Routing Optimized</span>
      </span>
    );
  }

  // Default 'pill'
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.2',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      title="BDIX Routing Optimized (Bangladesh Internet Exchange direct peer)"
      className={`inline-flex items-center gap-1 font-mono font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full shadow-xs ${sizeClasses[size]} ${className}`}
    >
      <Zap className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400 shrink-0" />
      <span>BDIX Optimized</span>
    </span>
  );
};
