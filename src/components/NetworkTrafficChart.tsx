import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VpnConnectionStatus } from '../types/vpn';
import { ArrowDown, ArrowUp, Activity, Zap, Sparkles } from 'lucide-react';

export interface TrafficPoint {
  id: number;
  time: number;
  download: number; // in KB/s
  upload: number; // in KB/s
  isHandshake: boolean;
  eventLabel?: string;
}

interface NetworkTrafficChartProps {
  status: VpnConnectionStatus;
  compact?: boolean;
  height?: number;
}

export const NetworkTrafficChart: React.FC<NetworkTrafficChartProps> = ({
  status,
  compact = false,
  height = 140,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dataPoints, setDataPoints] = useState<TrafficPoint[]>(() => {
    const initial: TrafficPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      initial.push({
        id: 24 - i,
        time: now - i * 1000,
        download: 8 + Math.random() * 5,
        upload: 4 + Math.random() * 3,
        isHandshake: false,
      });
    }
    return initial;
  });

  const [peakSpeed, setPeakSpeed] = useState<number>(14);
  const [handshakeAlert, setHandshakeAlert] = useState<string | null>(null);

  // Generate real-time data ticks reflecting VPN lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let dl = 0;
      let ul = 0;
      let isHandshake = false;
      let label: string | undefined = undefined;

      if (status === 'disconnected') {
        // Dormant idle traffic
        dl = Math.round(5 + Math.random() * 8);
        ul = Math.round(2 + Math.random() * 4);
      } else if (status === 'connecting') {
        // Handshake packet burst 1: DNS & SYN
        dl = Math.round(450 + Math.random() * 350);
        ul = Math.round(300 + Math.random() * 250);
        isHandshake = true;
        label = 'SYN / DNS';
        setHandshakeAlert('SYN / DNS Burst (750 KB/s)');
      } else if (status === 'authenticating') {
        // Handshake packet burst 2: Curve25519 / TLS Key Exchange spike
        dl = Math.round(1600 + Math.random() * 800);
        ul = Math.round(1200 + Math.random() * 600);
        isHandshake = true;
        label = 'Curve25519 DH';
        setHandshakeAlert('Curve25519 Key Exchange Spike (2.4 MB/s)');
      } else if (status === 'assigning_ip') {
        // Handshake packet burst 3: Virtual TUN Route allocation
        dl = Math.round(950 + Math.random() * 400);
        ul = Math.round(700 + Math.random() * 300);
        isHandshake = true;
        label = 'TUN Route';
        setHandshakeAlert('TUN 10.8.0.2 Route Injected');
      } else if (status === 'connected') {
        // Sustained high-throughput encrypted data streaming with realistic fluctuations
        const baseDl = 1800 + Math.sin(now / 3000) * 600;
        const baseUl = 550 + Math.cos(now / 2500) * 200;
        const randomSpike = Math.random() > 0.85 ? Math.random() * 1200 : 0;
        dl = Math.round(baseDl + randomSpike + (Math.random() * 200 - 100));
        ul = Math.round(baseUl + randomSpike * 0.4 + (Math.random() * 100 - 50));
        
        if (randomSpike > 800) {
          label = 'Egress Burst';
          setHandshakeAlert('Egress Data Spike');
        }
      }

      setDataPoints((prev) => {
        const nextId = (prev[prev.length - 1]?.id || 0) + 1;
        const next = [...prev.slice(1), {
          id: nextId,
          time: now,
          download: Math.max(0, dl),
          upload: Math.max(0, ul),
          isHandshake,
          eventLabel: label,
        }];
        const maxCurrent = Math.max(...next.map((p) => p.download));
        setPeakSpeed((p) => Math.max(p, maxCurrent));
        return next;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [status]);

  // Clear handshake alert after 2 seconds
  useEffect(() => {
    if (handshakeAlert) {
      const timer = setTimeout(() => setHandshakeAlert(null), 2200);
      return () => clearTimeout(timer);
    }
  }, [handshakeAlert]);

  // D3 Rendering effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || (compact ? 280 : 440);
    const chartHeight = height;

    const margin = compact 
      ? { top: 8, right: 6, bottom: 16, left: 6 }
      : { top: 16, right: 14, bottom: 24, left: 40 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Base SVG attributes
    svg
      .attr('width', width)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${width} ${chartHeight}`);

    // Gradients and Filters definition
    const defs = svg.append('defs');

    // Download Area Gradient (Emerald)
    const dlGradient = defs
      .append('linearGradient')
      .attr('id', `dl-gradient-${compact ? 'c' : 'e'}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    dlGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', status === 'connected' ? '#10b981' : '#f59e0b')
      .attr('stop-opacity', 0.55);

    dlGradient
      .append('stop')
      .attr('offset', '70%')
      .attr('stop-color', status === 'connected' ? '#059669' : '#d97706')
      .attr('stop-opacity', 0.15);

    dlGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', status === 'connected' ? '#047857' : '#92400e')
      .attr('stop-opacity', 0.0);

    // Upload Area Gradient (Sky Blue)
    const ulGradient = defs
      .append('linearGradient')
      .attr('id', `ul-gradient-${compact ? 'c' : 'e'}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    ulGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#38bdf8')
      .attr('stop-opacity', 0.35);

    ulGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0284c7')
      .attr('stop-opacity', 0.0);

    // Glow Filter
    const filter = defs
      .append('filter')
      .attr('id', `glow-${compact ? 'c' : 'e'}`)
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', 2.5)
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const xScale = d3
      .scaleLinear()
      .domain([0, dataPoints.length - 1])
      .range([0, innerWidth]);

    const maxVal = d3.max(dataPoints, (d) => Math.max(d.download, d.upload)) || 100;
    const yMax = Math.max(maxVal * 1.25, 40);

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Background horizontal grid lines
    if (!compact) {
      const yTicks = yScale.ticks(4);
      g.selectAll('.grid-line')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#334155')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '3 3');

      // Left Y-Axis
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(4)
        .tickFormat((d) => {
          const num = Number(d);
          return num >= 1000 ? `${(num / 1024).toFixed(1)}M` : `${num}K`;
        });

      const yAxisG = g
        .append('g')
        .call(yAxis)
        .attr('color', '#64748b')
        .attr('font-size', '9px')
        .attr('font-family', 'JetBrains Mono, monospace');

      yAxisG.select('.domain').remove();
      yAxisG.selectAll('.tick line').remove();
    }

    // Area generator for Upload (Background area)
    const ulArea = d3
      .area<TrafficPoint>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yScale(d.upload))
      .curve(d3.curveMonotoneX);

    // Area generator for Download (Foreground area)
    const dlArea = d3
      .area<TrafficPoint>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yScale(d.download))
      .curve(d3.curveMonotoneX);

    // Line generator for Download stroke
    const dlLine = d3
      .line<TrafficPoint>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d.download))
      .curve(d3.curveMonotoneX);

    // Line generator for Upload stroke
    const ulLine = d3
      .line<TrafficPoint>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d.upload))
      .curve(d3.curveMonotoneX);

    // Render Upload Area & Line
    g.append('path')
      .datum(dataPoints)
      .attr('fill', `url(#ul-gradient-${compact ? 'c' : 'e'})`)
      .attr('d', ulArea);

    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.8)
      .attr('d', ulLine);

    // Render Download Area & Line
    g.append('path')
      .datum(dataPoints)
      .attr('fill', `url(#dl-gradient-${compact ? 'c' : 'e'})`)
      .attr('d', dlArea);

    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'none')
      .attr('stroke', status === 'connected' ? '#10b981' : '#f59e0b')
      .attr('stroke-width', compact ? 1.8 : 2.2)
      .attr('filter', `url(#glow-${compact ? 'c' : 'e'})`)
      .attr('d', dlLine);

    // Render Handshake Spikes Marker circles
    dataPoints.forEach((p, idx) => {
      if (p.isHandshake) {
        const cx = xScale(idx);
        const cy = yScale(p.download);

        // Pulsing outer beacon
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 5)
          .attr('fill', '#f59e0b')
          .attr('fill-opacity', 0.3)
          .attr('class', 'animate-ping');

        // Solid marker
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 3)
          .attr('fill', '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.2);

        // Marker label in expanded mode
        if (!compact && p.eventLabel) {
          g.append('text')
            .attr('x', cx)
            .attr('y', Math.max(10, cy - 8))
            .attr('text-anchor', 'middle')
            .attr('fill', '#fbbf24')
            .attr('font-size', '8px')
            .attr('font-family', 'JetBrains Mono, monospace')
            .attr('font-weight', 'bold')
            .text(p.eventLabel);
        }
      }
    });

    // Current latest point pulsing beacon
    if (dataPoints.length > 0) {
      const lastIdx = dataPoints.length - 1;
      const lastP = dataPoints[lastIdx];
      const cx = xScale(lastIdx);
      const cy = yScale(lastP.download);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', compact ? 4 : 5)
        .attr('fill', status === 'connected' ? '#34d399' : '#f59e0b')
        .attr('class', 'animate-ping');

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', compact ? 2.5 : 3.5)
        .attr('fill', '#ffffff')
        .attr('stroke', status === 'connected' ? '#10b981' : '#f59e0b')
        .attr('stroke-width', 1.5);
    }
  }, [dataPoints, status, compact, height]);

  const latest = dataPoints[dataPoints.length - 1] || { download: 0, upload: 0 };

  return (
    <div ref={containerRef} className="w-full relative select-none">
      {/* Header bar with real-time stats and Handshake Alert */}
      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${status === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-semibold text-slate-300">
            {compact ? 'Real-Time D3 Throughput' : 'D3 Real-Time Network Egress & Handshake Monitor'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Tag */}
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowDown className="w-3 h-3" />
            <span className="tabular-nums font-bold">
              {latest.download >= 1024 
                ? `${(latest.download / 1024).toFixed(2)} MB/s` 
                : `${latest.download} KB/s`}
            </span>
          </span>

          {/* Upload Tag */}
          <span className="flex items-center gap-1 text-sky-400">
            <ArrowUp className="w-3 h-3" />
            <span className="tabular-nums font-bold">
              {latest.upload >= 1024 
                ? `${(latest.upload / 1024).toFixed(2)} MB/s` 
                : `${latest.upload} KB/s`}
            </span>
          </span>
        </div>
      </div>

      {/* Handshake Spike Banner Notification */}
      {handshakeAlert && (
        <div className="absolute top-7 left-3 z-10 bg-amber-500/90 text-slate-950 font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-1 animate-in fade-in duration-150">
          <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
          <span>{handshakeAlert}</span>
        </div>
      )}

      {/* SVG Canvas for D3 Area Chart */}
      <div className={`w-full overflow-hidden rounded-xl border ${
        compact 
          ? 'bg-slate-950/80 border-slate-800/80' 
          : 'bg-slate-950/95 border-slate-800 shadow-inner'
      }`}>
        <svg ref={svgRef} className="w-full block" />
      </div>

      {/* Bottom Chart Footer Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Rx Download</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-slate-400">Tx Upload</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Handshake Spike</span>
          </span>
        </div>

        <span className="text-slate-500 tabular-nums">
          Peak: {peakSpeed >= 1024 ? `${(peakSpeed / 1024).toFixed(1)} MB/s` : `${peakSpeed} KB/s`}
        </span>
      </div>
    </div>
  );
};
