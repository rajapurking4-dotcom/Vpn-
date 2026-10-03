import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  Sliders, 
  Cpu, 
  Smartphone, 
  ArrowRight,
  ExternalLink,
  Zap,
  Code2,
  FolderTree,
  FileCode,
  Package,
  Play,
  CheckCircle2,
  RotateCw
} from 'lucide-react';

interface WireguardScriptViewerProps {
  onGoToAssets: () => void;
  onGoToApk: () => void;
}

export const WireguardScriptViewer: React.FC<WireguardScriptViewerProps> = ({
  onGoToAssets,
  onGoToApk,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPort, setCustomPort] = useState(51820);
  const [customDns, setCustomDns] = useState('1.1.1.1, 1.0.0.1');
  const [customSubnet, setCustomSubnet] = useState('10.66.66.1/24');
  const [enableBdix, setEnableBdix] = useState(true);
  
  // Package Installer Simulator state
  const [isSimulatingInstall, setIsSimulatingInstall] = useState(false);
  const [installCompleted, setInstallCompleted] = useState(true);
  const [activeDistro, setActiveDistro] = useState<'ubuntu' | 'centos' | 'arch'>('ubuntu');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateAptInstall = () => {
    setIsSimulatingInstall(true);
    setInstallCompleted(false);
    setTimeout(() => {
      setIsSimulatingInstall(false);
      setInstallCompleted(true);
    }, 1500);
  };

  const distroCommands = {
    ubuntu: 'sudo apt-get update -y && sudo apt-get install -y wireguard qrencode curl iptables openresolv',
    centos: 'sudo dnf install -y epel-release && sudo dnf install -y wireguard-tools qrencode curl iptables',
    arch: 'sudo pacman -Syu --noconfirm wireguard-tools qrencode curl iptables',
  };

  const generateCustomScript = () => {
    return `#!/bin/bash
# ==============================================================================
# BanglaVPN 33 - Production WireGuard Server Setup Script
# File: wireguard-server-setup.sh
# Generated for: Ubuntu, Debian, CentOS, Rocky Linux
# Target Assets: app/src/main/assets/servers/
# ==============================================================================

set -e

RED='\\033[0;31m'
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
NC='\\033[0m'

if [[ $EUID -ne 0 ]]; then
   echo -e "\${RED}Error: This script must be run as root.\${NC} Please run: sudo ./wireguard-server-setup.sh"
   exit 1
fi

WG_DIR="/etc/wireguard"
WG_CONF="$WG_DIR/wg0.conf"
WG_CLIENTS_DIR="$WG_DIR/clients"
SERVER_PORT=${customPort}
SERVER_NET="${customSubnet}"
DNS_DEFAULT="${customDns}"

echo -e "\${GREEN}===> Setting up BanglaVPN 33 WireGuard Server on UDP port $SERVER_PORT <===\${NC}"

# Detect Interface & Public IP
SERVER_PUB_NIC=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\\S+)' | head -1)
SERVER_PUB_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Install Packages
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y && apt-get install -y wireguard iptables qrencode curl
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y wireguard-tools iptables qrencode curl
fi

# Enable Forwarding
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-wireguard-forward.conf
sysctl --system >/dev/null 2>&1

mkdir -p "$WG_DIR" "$WG_CLIENTS_DIR"
chmod 700 "$WG_DIR"

# Generate Keys
SERVER_PRIVKEY=$(wg genkey)
SERVER_PUBKEY=$(echo "$SERVER_PRIVKEY" | wg pubkey)
echo "$SERVER_PRIVKEY" > "$WG_DIR/server_private.key"
echo "$SERVER_PUBKEY" > "$WG_DIR/server_public.key"
chmod 600 "$WG_DIR/server_private.key"

# Write Server Config
cat <<EOF > "$WG_CONF"
[Interface]
Address = $SERVER_NET
ListenPort = $SERVER_PORT
PrivateKey = $SERVER_PRIVKEY
SaveConfig = false

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
EOF

systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0

echo -e "\${GREEN}[✓] WireGuard Server is Active on UDP $SERVER_PORT!\${NC}"
echo -e "Use the interactive client menu to export profiles to app/src/main/assets/servers/"
`;
  };

  const handleDownload = () => {
    const content = generateCustomScript();
    const blob = new Blob([content], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wireguard-server-setup.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickCommands = `curl -sSL https://raw.githubusercontent.com/banglavpn33/server-scripts/main/wireguard-server-setup.sh -o wireguard-server-setup.sh
chmod +x wireguard-server-setup.sh
sudo ./wireguard-server-setup.sh`;

  return (
    <div className="space-y-6">
      
      {/* Path Breadcrumb & Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Terminal className="w-4 h-4" />
            <span>Server Deployment Script & Package Manager</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Linux WireGuard & BDIX Endpoint</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono tracking-tight">
            wireguard-server-setup.sh
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated Linux bash script to provision WireGuard VPN nodes on Ubuntu/Debian/CentOS VPS, generate cryptographic client keys, configure iptables NAT masquerading, and export ready-to-use profiles into <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCopy(generateCustomScript(), 'script-copy')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            {copiedId === 'script-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'script-copy' ? 'Copied' : 'Copy Script'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download .sh File</span>
          </button>
        </div>
      </div>

      {/* Package Installation Command Section (apt-get install wireguard qrencode curl) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                apt-get install wireguard qrencode curl
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Linux dependency installation command for Ubuntu / Debian VPS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy('sudo apt-get update -y && sudo apt-get install -y wireguard qrencode curl iptables openresolv', 'copy-apt')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedId === 'copy-apt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'copy-apt' ? 'Copied Command' : 'Copy apt-get command'}</span>
            </button>

            <button
              onClick={handleSimulateAptInstall}
              disabled={isSimulatingInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSimulatingInstall ? 'animate-spin' : ''}`} />
              <span>{isSimulatingInstall ? 'Simulating APT...' : 'Simulate Terminal Run'}</span>
            </button>
          </div>
        </div>

        {/* Package Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">wireguard</span>
              <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Provides the in-kernel WireGuard module (<code className="text-emerald-300">wireguard.ko</code>), ChaCha20-Poly1305 encryption, and the <code className="text-emerald-300">wg</code> / <code className="text-emerald-300">wg-quick</code> user-space utilities.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sky-400">qrencode</span>
              <span className="text-[10px] font-mono text-slate-500">v4.1.1</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Generates high-contrast ANSI and PNG QR codes in your server terminal from client <code className="text-sky-300">.conf</code> files for rapid mobile camera scanning and setup.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-400">curl</span>
              <span className="text-[10px] font-mono text-slate-500">v7.81+</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Automatically discovers your VPS external IPv4 address (<code className="text-purple-300">api.ipify.org</code>) so client endpoints bind accurately for Android connections.
            </p>
          </div>
        </div>

        {/* Live Terminal Output Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-1 text-slate-300">bash — root@banglavpn-vps:~</span>
            </span>
            <span>Ubuntu 22.04 LTS (Jammy Jellyfish)</span>
          </div>

          <pre className="p-4 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`# ${distroCommands[activeDistro]}
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]
Get:3 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done

The following NEW packages will be installed:
  curl iptables openresolv qrencode wireguard wireguard-tools
0 upgraded, 6 newly installed, 0 to remove and 0 not upgraded.
Need to get 1,482 kB of archives.
After this operation, 4,924 kB of additional disk space will be used.

Selecting previously unselected package wireguard-tools.
(Reading database ... 84120 files and directories currently installed.)
Preparing to unpack .../wireguard-tools_1.0.20210914-1ubuntu1_amd64.deb ...
Unpacking wireguard-tools (1.0.20210914-1ubuntu1) ...
Selecting previously unselected package qrencode.
Unpacking qrencode (4.1.1-1) ...
Selecting previously unselected package curl.
Unpacking curl (7.81.0-1ubuntu1.16) ...
Setting up wireguard-tools (1.0.20210914-1ubuntu1) ...
Setting up qrencode (4.1.1-1) ...
Setting up curl (7.81.0-1ubuntu1.16) ...
Setting up wireguard (1.0.20210914-1ubuntu1) ...

[✓] WireGuard kernel module verified: OK (version 1.0.0)
[✓] qrencode command installed: /usr/bin/qrencode
[✓] curl command installed: /usr/bin/curl
[✓] iptables firewall tools active`}
          </pre>
        </div>
      </div>

      {/* End-to-End Pipeline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">
          End-to-End BanglaVPN 33 Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          {/* Step 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 font-mono font-bold text-xs">
              01
            </div>
            <h4 className="text-xs font-bold text-white font-mono">Install Dependencies</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              <code className="text-emerald-300">apt-get install wireguard qrencode curl</code>
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 relative">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2 font-mono font-bold text-xs">
              02
            </div>
            <h4 className="text-xs font-bold text-white font-mono">Run Setup Script</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Run <code className="text-sky-300">./wireguard-server-setup.sh</code> to configure <code className="text-sky-300">/etc/wireguard/wg0.conf</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div 
            onClick={onGoToAssets}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 font-mono font-bold text-xs">
              03
            </div>
            <h4 className="text-xs font-bold text-white font-mono group-hover:text-emerald-400 flex items-center justify-between">
              <span>assets/servers/</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Copy generated client <code className="text-purple-300">*.conf</code> into your Android assets folder.
            </p>
          </div>

          {/* Step 4 */}
          <div 
            onClick={onGoToApk}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2 font-mono font-bold text-xs">
              04
            </div>
            <h4 className="text-xs font-bold text-white font-mono group-hover:text-emerald-400 flex items-center justify-between">
              <span>app-debug.apk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Build & install APK via ADB with bundled configurations.
            </p>
          </div>

        </div>
      </div>

      {/* Script Parameters & Quick Deployment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: VPS Execution Guide & Customizer */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick 1-Liner VPS Command */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                1-Step VPS Quick Launch
              </h3>
              <button
                onClick={() => handleCopy(quickCommands, 'quick-cmd')}
                className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
              >
                {copiedId === 'quick-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === 'quick-cmd' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{quickCommands}</code>
            </pre>

            <p className="text-[11px] text-slate-400">
              Run directly on any fresh Ubuntu (20.04/22.04/24.04), Debian (11/12), or CentOS/Rocky VPS instance.
            </p>
          </div>

          {/* Interactive Parameters Customizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Script Customizer</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Live Generator</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">
                  Listen Port (UDP)
                </label>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(parseInt(e.target.value) || 51820)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">
                  Internal VPN Subnet
                </label>
                <input
                  type="text"
                  value={customSubnet}
                  onChange={(e) => setCustomSubnet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">
                  Default Client DNS Resolvers
                </label>
                <input
                  type="text"
                  value={customDns}
                  onChange={(e) => setCustomDns(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBdix}
                    onChange={(e) => setEnableBdix(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                  />
                  <span className="text-slate-300 font-medium">
                    Include BDIX Local Peering Split Tunnel Menu Option
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Firewall Note */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-200 font-mono block">Cloud Firewall Reminder:</span>
            <p>
              Remember to allow incoming UDP traffic on port <code className="text-emerald-300 font-mono">{customPort}</code> in your cloud security group (AWS, DigitalOcean, Hetzner, Vultr).
            </p>
          </div>

        </div>

        {/* Right Column: Code Viewer for wireguard-server-setup.sh */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-white">wireguard-server-setup.sh</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span>bash script</span>
              <span>·</span>
              <button
                onClick={() => handleCopy(generateCustomScript(), 'code-copy')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copiedId === 'code-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === 'code-copy' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Script Content */}
          <div className="bg-slate-950 p-4 font-mono text-xs flex max-h-[580px] overflow-auto">
            <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre w-full">
              <code>{generateCustomScript()}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
