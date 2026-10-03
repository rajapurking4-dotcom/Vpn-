import React, { useState } from 'react';
import { 
  Server, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  Activity, 
  FileCode, 
  Layers, 
  Terminal, 
  ArrowRight,
  ExternalLink,
  RotateCw,
  Users
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';

interface PeerItem {
  id: string;
  name: string;
  flag: string;
  allowedIp: string;
  publicKey: string;
  presharedKey: string;
  lastHandshake: string;
  transferTx: string;
  transferRx: string;
  assetFile: string;
}

const INITIAL_PEERS: PeerItem[] = [
  {
    id: 'peer-jp',
    name: 'Japan (Tokyo Node)',
    flag: '🇯🇵',
    allowedIp: '10.66.66.2/32',
    publicKey: 'Yk2Vb3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u=',
    presharedKey: 'b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w=',
    lastHandshake: '1 minute ago',
    transferTx: '142.4 MB',
    transferRx: '840.1 MB',
    assetFile: 'Japan (example).conf',
  },
  {
    id: 'peer-de',
    name: 'Germany (Frankfurt Node)',
    flag: '🇩🇪',
    allowedIp: '10.66.66.3/32',
    publicKey: 'Z9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u=',
    presharedKey: 'c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x=',
    lastHandshake: '5 minutes ago',
    transferTx: '45.1 MB',
    transferRx: '128.9 MB',
    assetFile: 'Germany (example).conf',
  },
  {
    id: 'peer-us',
    name: 'USA (New York Node)',
    flag: '🇺🇸',
    allowedIp: '10.66.66.4/32',
    publicKey: 'X8w7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c=',
    presharedKey: 'd3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y=',
    lastHandshake: '12 seconds ago',
    transferTx: '310.8 MB',
    transferRx: '1.2 GB',
    assetFile: 'USA (example).conf',
  },
  {
    id: 'peer-sg',
    name: 'Singapore (SG Fast Node)',
    flag: '🇸🇬',
    allowedIp: '10.66.66.5/32',
    publicKey: 'W7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b=',
    presharedKey: 'e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z=',
    lastHandshake: '3 seconds ago',
    transferTx: '640.2 MB',
    transferRx: '3.4 GB',
    assetFile: 'Singapore (SG Fast).conf',
  },
  {
    id: 'peer-bd',
    name: 'Bangladesh (Dhaka BDIX Node)',
    flag: '🇧🇩',
    allowedIp: '10.66.66.6/32',
    publicKey: 'V6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a=',
    presharedKey: 'f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a=',
    lastHandshake: 'Just now',
    transferTx: '890.5 MB',
    transferRx: '4.8 GB',
    assetFile: 'Bangladesh (Dhaka BDIX).conf',
  },
  {
    id: 'peer-uk',
    name: 'United Kingdom (London Node)',
    flag: '🇬🇧',
    allowedIp: '10.66.66.7/32',
    publicKey: 'U5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z=',
    presharedKey: 'g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b=',
    lastHandshake: '18 minutes ago',
    transferTx: '84.2 MB',
    transferRx: '512.6 MB',
    assetFile: 'United Kingdom (London).conf',
  },
  {
    id: 'peer-nl',
    name: 'Netherlands (Amsterdam Node)',
    flag: '🇳🇱',
    allowedIp: '10.66.66.8/32',
    publicKey: 'T4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z4y=',
    presharedKey: 'h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c=',
    lastHandshake: '42 seconds ago',
    transferTx: '210.3 MB',
    transferRx: '1.45 GB',
    assetFile: 'Netherlands (Amsterdam).conf',
  },
];

interface WgServerConfigViewerProps {
  onGoToAssets: () => void;
  onGoToApk: () => void;
  onAddServerAsset: (newServer: ServerConfig) => void;
}

export const WgServerConfigViewer: React.FC<WgServerConfigViewerProps> = ({
  onGoToAssets,
  onGoToApk,
  onAddServerAsset,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'peers' | 'runtime'>('editor');
  const [peers, setPeers] = useState<PeerItem[]>(INITIAL_PEERS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isAddingPeer, setIsAddingPeer] = useState(false);
  const [newPeerName, setNewPeerName] = useState('United Kingdom (London)');
  const [newPeerFlag, setNewPeerFlag] = useState('🇬🇧');

  // Build current wg0.conf text from state
  const buildWg0Text = () => {
    let conf = `# ==============================================================================
# BanglaVPN 33 - Master WireGuard Server Configuration
# Path: /etc/wireguard/wg0.conf
# Managed by: wireguard-server-setup.sh
# Endpoints feed directly to: app/src/main/assets/servers/
# ==============================================================================

[Interface]
# Server VPN subnet address
Address = 10.66.66.1/24, fd42:42:42::1/64
ListenPort = 51820
PrivateKey = aEG4/8F2j9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f=
SaveConfig = false

# NAT Masquerading and Packet Forwarding Rules
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE; ip6tables -A FORWARD -i wg0 -j ACCEPT 2>/dev/null || true
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE; ip6tables -D FORWARD -i wg0 -j ACCEPT 2>/dev/null || true

# ------------------------------------------------------------------------------
# Active Client Peers (${peers.length} Registered Nodes)
# ------------------------------------------------------------------------------
`;

    peers.forEach((p) => {
      conf += `
# Client: ${p.name} -> app/src/main/assets/servers/${p.assetFile}
[Peer]
PublicKey = ${p.publicKey}
PresharedKey = ${p.presharedKey}
AllowedIPs = ${p.allowedIp}
`;
    });

    return conf;
  };

  const [rawContent, setRawContent] = useState(buildWg0Text());

  // Handle Copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Download wg0.conf
  const handleDownload = () => {
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wg0.conf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Save
  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  // Add peer
  const handleAddPeer = (e: React.FormEvent) => {
    e.preventDefault();
    const nextOctet = peers.length + 2;
    const cleanFilename = `${newPeerName}.conf`;
    const newPeer: PeerItem = {
      id: `peer-${Date.now()}`,
      name: newPeerName,
      flag: newPeerFlag,
      allowedIp: `10.66.66.${nextOctet}/32`,
      publicKey: `Key${Math.random().toString(36).substring(2, 15)}Pub=`,
      presharedKey: `Psk${Math.random().toString(36).substring(2, 15)}Key=`,
      lastHandshake: 'Waiting connection...',
      transferTx: '0 KB',
      transferRx: '0 KB',
      assetFile: cleanFilename,
    };

    const updatedPeers = [...peers, newPeer];
    setPeers(updatedPeers);

    // Also auto-add to server assets
    const newServerConfig: ServerConfig = {
      id: `wg-${Date.now()}`,
      filename: cleanFilename,
      country: newPeerName.split(' ')[0],
      city: 'Secure Node',
      countryCode: 'UN',
      flag: newPeerFlag,
      host: 'wg-hub01.banglavpn33.net',
      port: 51820,
      protocol: 'udp',
      cipher: 'CHACHA20-POLY1305',
      ping: 45,
      load: 15,
      category: 'Free',
      recommendedFor: 'WireGuard ultra-fast low battery consumption tunnel',
      authType: 'inline-cert',
      rawConfig: `[Interface]
PrivateKey = ClientPrivKey${Math.random().toString(36).substring(2, 10)}=
Address = 10.66.66.${nextOctet}/24
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = aEG4/8F2j9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f=
PresharedKey = ${newPeer.presharedKey}
Endpoint = wg-hub01.banglavpn33.net:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`,
      isCustom: true,
    };

    onAddServerAsset(newServerConfig);
    setIsAddingPeer(false);
  };

  // Remove peer
  const handleRemovePeer = (id: string) => {
    setPeers(peers.filter((p) => p.id !== id));
  };

  const lines = rawContent.split('\n');

  return (
    <div className="space-y-6">
      
      {/* Path Breadcrumb & Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Server className="w-4 h-4" />
            <span>Master Linux WireGuard Configuration</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-semibold">{peers.length} Connected Peers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono tracking-tight">
            /etc/wireguard/wg0.conf
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            The kernel network interface configuration for the WireGuard VPN daemon. It manages the server's private keys, listening port <code className="text-emerald-300 font-mono">51820/UDP</code>, iptables masquerade NAT, and all client peer allowances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCopy(rawContent, 'copy-conf')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            {copiedId === 'copy-conf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'copy-conf' ? 'Copied' : 'Copy wg0.conf'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download wg0.conf</span>
          </button>
        </div>
      </div>

      {/* Interface Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-500 text-[10px] block">INTERFACE</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            wg0 (Active)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-500 text-[10px] block">LISTEN PORT</span>
          <span className="text-white font-semibold mt-0.5 block">51820 / UDP</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-500 text-[10px] block">SERVER SUBNET</span>
          <span className="text-slate-200 font-semibold mt-0.5 block">10.66.66.1/24</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-500 text-[10px] block">REGISTERED PEERS</span>
          <span className="text-emerald-300 font-semibold mt-0.5 block">{peers.length} Client Profiles</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'editor'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>wg0.conf Editor & Directives</span>
        </button>

        <button
          onClick={() => setActiveSubTab('peers')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'peers'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Peer IP Table & Client Sync ({peers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('runtime')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'runtime'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Kernel Runtime (wg show wg0)</span>
        </button>
      </div>

      {/* Tab 1: Live Editor */}
      {activeSubTab === 'editor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-white">
                /etc/wireguard/wg0.conf
              </span>
            </div>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Configuration updated!
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Validation Bar */}
          <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">✓ Valid WireGuard Server Syntax</span>
              <span>·</span>
              <span>ChaCha20-Poly1305</span>
              <span>·</span>
              <span>iptables MASQUERADE OK</span>
            </div>
            <div>
              <span>{lines.length} lines · {rawContent.length} bytes</span>
            </div>
          </div>

          {/* Editor Area */}
          <div className="bg-slate-950 p-4 font-mono text-xs flex max-h-[500px] overflow-auto">
            <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 leading-relaxed font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="flex-1 bg-transparent text-slate-200 pl-4 resize-none focus:outline-none font-mono leading-relaxed selection:bg-emerald-500/30 w-full min-h-[380px]"
              spellCheck={false}
            />
          </div>

          {/* Footer explanation */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>To apply changes without dropping connections on your Linux server:</span>
            <code className="p-1.5 bg-slate-900 border border-slate-800 rounded text-emerald-300 font-mono text-[11px]">
              wg syncconf wg0 &lt;(wg-quick strip wg0)
            </code>
          </div>
        </div>
      )}

      {/* Tab 2: Peers & IP Allocations */}
      {activeSubTab === 'peers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Peers in /etc/wireguard/wg0.conf</h3>
              <p className="text-xs text-slate-400">
                Each peer corresponds to an Android server configuration in <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code>.
              </p>
            </div>

            <button
              onClick={() => setIsAddingPeer(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950" />
              <span>Register New Peer</span>
            </button>
          </div>

          {/* Add Peer Modal */}
          {isAddingPeer && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 animate-in fade-in duration-150 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Register New Peer & Generate Android Asset Profile
              </h4>

              <form onSubmit={handleAddPeer} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peer Location Name</label>
                  <input
                    type="text"
                    value={newPeerName}
                    onChange={(e) => setNewPeerName(e.target.value)}
                    required
                    placeholder="e.g. United Kingdom (London)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country Flag Emoji</label>
                  <input
                    type="text"
                    value={newPeerFlag}
                    onChange={(e) => setNewPeerFlag(e.target.value)}
                    required
                    placeholder="🇬🇧"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                  >
                    Append to wg0.conf
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingPeer(false)}
                    className="px-3 py-2 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Peers Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4 font-medium">Peer Node</th>
                    <th className="py-3 px-4 font-medium">Assigned Virtual IP</th>
                    <th className="py-3 px-4 font-medium">Public Key (Base64)</th>
                    <th className="py-3 px-4 font-medium">Handshake Status</th>
                    <th className="py-3 px-4 font-medium">Transfer (TX / RX)</th>
                    <th className="py-3 px-4 font-medium">Target Android Asset</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {peers.map((peer) => (
                    <tr key={peer.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl select-none">{peer.flag}</span>
                          <span className="font-semibold text-white font-sans">{peer.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-emerald-400 tabular-nums">
                        {peer.allowedIp}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-[11px] truncate max-w-[140px]" title={peer.publicKey}>
                        {peer.publicKey}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{peer.lastHandshake}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 tabular-nums text-[11px]">
                        {peer.transferTx} / {peer.transferRx}
                      </td>

                      <td className="py-3 px-4 text-emerald-300 text-[11px]">
                        {peer.assetFile}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemovePeer(peer.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 transition-colors"
                          title="Revoke peer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runtime Kernel Output */}
      {activeSubTab === 'runtime' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>Kernel Telemetry Inspector (wg show wg0)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">WireGuard v1.0.20210611</span>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto">
{`interface: wg0
  public key: aEG4/8F2j9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f=
  private key: (hidden)
  listening port: 51820

peer: Yk2Vb3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u=
  endpoint: 103.134.58.12:41920
  allowed ips: 10.66.66.2/32
  latest handshake: 1 minute, 14 seconds ago
  transfer: 142.40 MiB received, 840.12 MiB sent
  persistent keepalive: every 25 seconds

peer: W7v6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b=
  endpoint: 103.134.58.88:52194
  allowed ips: 10.66.66.5/32
  latest handshake: 3 seconds ago
  transfer: 640.21 MiB received, 3.42 GiB sent
  persistent keepalive: every 25 seconds

peer: V6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a=
  endpoint: 103.134.58.19:49811
  allowed ips: 10.66.66.6/32
  latest handshake: 1 second ago
  transfer: 890.50 MiB received, 4.81 GiB sent (BDIX direct)`}
          </pre>
        </div>
      )}

    </div>
  );
};
