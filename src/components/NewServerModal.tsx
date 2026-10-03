import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, FileText, Check, AlertCircle } from 'lucide-react';
import { ServerConfig } from '../types/vpn';
import { generateOpenVpnConfig, parseConfigFile } from '../utils/configParser';
import { BdixBadge } from './BdixBadge';

interface NewServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddServer: (newServer: ServerConfig) => void;
}

export const NewServerModal: React.FC<NewServerModalProps> = ({
  isOpen,
  onClose,
  onAddServer,
}) => {
  const [tab, setTab] = useState<'generator' | 'upload' | 'raw'>('generator');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generator form state
  const [country, setCountry] = useState('Singapore');
  const [city, setCity] = useState('Jurong');
  const [countryCode, setCountryCode] = useState('SG');
  const [flag, setFlag] = useState('🇸🇬');
  const [filename, setFilename] = useState('Singapore (Ultra Fast).conf');
  const [host, setHost] = useState('sg-speed01.banglavpn33.net');
  const [port, setPort] = useState(1194);
  const [protocol, setProtocol] = useState<'udp' | 'tcp'>('udp');
  const [cipher, setCipher] = useState<'AES-256-GCM' | 'AES-128-GCM' | 'CHACHA20-POLY1305'>('AES-256-GCM');
  const [category, setCategory] = useState<'Free' | 'VIP' | 'BDIX' | 'Streaming' | 'Gaming'>('Free');
  const [dns, setDns] = useState('1.1.1.1, 1.0.0.1');
  const [bdixOptimized, setBdixOptimized] = useState(false);

  // Raw paste state
  const [rawFilename, setRawFilename] = useState('Custom Server.conf');
  const [rawText, setRawText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCountryPreset = (preset: { country: string; city: string; code: string; flag: string; defaultHost: string }) => {
    setCountry(preset.country);
    setCity(preset.city);
    setCountryCode(preset.code);
    setFlag(preset.flag);
    setFilename(`${preset.country} (Custom).conf`);
    setHost(preset.defaultHost);
    if (preset.code === 'BD') {
      setCategory('BDIX');
      setBdixOptimized(true);
    }
  };

  const handleCreateFromGenerator = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFilename = filename.endsWith('.conf') ? filename : `${filename}.conf`;
    const generatedConfig = generateOpenVpnConfig({
      filename: cleanFilename,
      host,
      port,
      protocol,
      cipher,
      dns,
      bdixOptimized,
    });

    const newServer: ServerConfig = {
      id: `custom-${Date.now()}`,
      filename: cleanFilename,
      country,
      city,
      countryCode,
      flag,
      host,
      port,
      protocol,
      cipher,
      ping: Math.floor(Math.random() * 40) + (countryCode === 'BD' ? 8 : 45),
      load: Math.floor(Math.random() * 30) + 15,
      category,
      isBdixOptimized: bdixOptimized,
      recommendedFor: bdixOptimized ? 'BDIX local high-speed routing' : `${country} direct secure tunnel`,
      authType: 'inline-cert',
      rawConfig: generatedConfig,
      isCustom: true,
    };

    onAddServer(newServer);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseConfigFile(file.name, text);

        const newServer: ServerConfig = {
          id: `custom-${Date.now()}`,
          filename: file.name,
          country: parsed.country || 'Custom Location',
          city: 'Gateway',
          countryCode: parsed.countryCode || 'UN',
          flag: parsed.flag || '🌐',
          host: parsed.host || '127.0.0.1',
          port: parsed.port || 1194,
          protocol: parsed.protocol || 'udp',
          cipher: parsed.cipher || 'AES-256-GCM',
          ping: 65,
          load: 25,
          category: (parsed.countryCode === 'BD' || file.name.toLowerCase().includes('bdix')) ? 'BDIX' : 'Free',
          isBdixOptimized: file.name.toLowerCase().includes('bdix') || text.includes('BDIX') || (parsed.countryCode === 'BD'),
          recommendedFor: 'User imported custom configuration',
          authType: parsed.authType || 'inline-cert',
          rawConfig: text,
          isCustom: true,
        };

        onAddServer(newServer);
        onClose();
      } catch (err: any) {
        setUploadError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateFromRaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const cleanFilename = rawFilename.endsWith('.conf') || rawFilename.endsWith('.ovpn')
      ? rawFilename
      : `${rawFilename}.conf`;

    const parsed = parseConfigFile(cleanFilename, rawText);

    const newServer: ServerConfig = {
      id: `custom-${Date.now()}`,
      filename: cleanFilename,
      country: parsed.country || 'Custom',
      city: 'Node',
      countryCode: parsed.countryCode || 'UN',
      flag: parsed.flag || '🌐',
      host: parsed.host || '127.0.0.1',
      port: parsed.port || 1194,
      protocol: parsed.protocol || 'udp',
      cipher: parsed.cipher || 'AES-256-GCM',
      ping: 50,
      load: 20,
      category: (parsed.countryCode === 'BD' || cleanFilename.toLowerCase().includes('bdix')) ? 'BDIX' : 'Free',
      isBdixOptimized: cleanFilename.toLowerCase().includes('bdix') || rawText.includes('BDIX') || (parsed.countryCode === 'BD'),
      recommendedFor: 'Custom configuration',
      authType: parsed.authType || 'inline-cert',
      rawConfig: rawText,
      isCustom: true,
    };

    onAddServer(newServer);
    onClose();
  };

  const presets = [
    { country: 'Bangladesh', city: 'Dhaka', code: 'BD', flag: '🇧🇩', defaultHost: 'bd-ix02.banglavpn33.net' },
    { country: 'Singapore', city: 'Jurong', code: 'SG', flag: '🇸🇬', defaultHost: 'sg-node02.banglavpn33.net' },
    { country: 'Japan', city: 'Tokyo', code: 'JP', flag: '🇯🇵', defaultHost: 'jp-node03.banglavpn33.net' },
    { country: 'United States', city: 'Los Angeles', code: 'US', flag: '🇺🇸', defaultHost: 'us-la01.banglavpn33.net' },
    { country: 'United Kingdom', city: 'Manchester', code: 'GB', flag: '🇬🇧', defaultHost: 'uk-man01.banglavpn33.net' },
    { country: 'Germany', city: 'Berlin', code: 'DE', flag: '🇩🇪', defaultHost: 'de-ber01.banglavpn33.net' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-semibold text-white">Add Server Configuration</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Creates a valid .conf file for app/src/main/assets/servers/
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tab === 'generator'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Generator</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tab === 'upload'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload .conf / .ovpn</span>
          </button>

          <button
            onClick={() => setTab('raw')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              tab === 'raw'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Raw Config</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'generator' && (
            <form onSubmit={handleCreateFromGenerator} className="space-y-4 text-xs">
              {/* Quick Country Presets */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Quick Country Templates
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => handleCountryPreset(p)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        countryCode === p.code
                          ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-xl mb-1">{p.flag}</span>
                      <span className="font-semibold truncate w-full text-[11px]">{p.country}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Filename in assets/servers/
                  </label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    required
                    placeholder="Singapore (Ultra Fast).conf"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Free">Free Server</option>
                    <option value="VIP">VIP Premium</option>
                    <option value="BDIX">BDIX Local Peering</option>
                    <option value="Gaming">Low Ping Gaming</option>
                    <option value="Streaming">Streaming Unlock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Server Host or IP
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                    placeholder="sg-speed01.banglavpn33.net"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 1194)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Protocol
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProtocol('udp')}
                      className={`flex-1 py-2 rounded-lg border font-mono font-medium transition-colors ${
                        protocol === 'udp'
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      UDP (Fastest)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProtocol('tcp')}
                      className={`flex-1 py-2 rounded-lg border font-mono font-medium transition-colors ${
                        protocol === 'tcp'
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      TCP (Firewall Bypass)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Encryption Cipher
                  </label>
                  <select
                    value={cipher}
                    onChange={(e) => setCipher(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="AES-256-GCM">AES-256-GCM (Military Grade)</option>
                    <option value="CHACHA20-POLY1305">CHACHA20-POLY1305 (Mobile CPU Fast)</option>
                    <option value="AES-128-GCM">AES-128-GCM (High Speed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  DNS Resolvers
                </label>
                <input
                  type="text"
                  value={dns}
                  onChange={(e) => setDns(e.target.value)}
                  placeholder="1.1.1.1, 1.0.0.1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bdixOptimized}
                    onChange={(e) => setBdixOptimized(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">
                      Enable BDIX Routing Optimization (Direct domestic route bypass)
                    </span>
                    <BdixBadge variant="glow" />
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Generate & Add to Assets</span>
                </button>
              </div>
            </form>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".conf,.ovpn"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Choose a .conf or .ovpn file
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-3">
                  Drag and drop your OpenVPN client profile here, or click to browse files from your disk.
                </p>
                <span className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700">
                  Select File from Computer
                </span>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Automatic File Extraction:</p>
                <p>• The filename will be kept as the server asset name in Android.</p>
                <p>• Server host, remote port, protocol, and inline certificates are parsed automatically.</p>
              </div>
            </div>
          )}

          {tab === 'raw' && (
            <form onSubmit={handleCreateFromRaw} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Filename for assets/servers/
                </label>
                <input
                  type="text"
                  value={rawFilename}
                  onChange={(e) => setRawFilename(e.target.value)}
                  required
                  placeholder="Singapore - SG1.conf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Raw OpenVPN Configuration (.conf / .ovpn)
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  required
                  rows={10}
                  placeholder={`client\ndev tun\nproto udp\nremote my-server.com 1194\nresolv-retry infinite\nnobind\npersist-key\npersist-tun\n...`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Save to Assets</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
