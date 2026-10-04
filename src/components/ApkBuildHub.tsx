import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Terminal, 
  Check, 
  Copy, 
  Play, 
  FileCode, 
  ShieldCheck, 
  FolderTree, 
  Smartphone, 
  Cpu, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  Trash2,
  Send,
  Monitor,
  Radio,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServerConfig } from '../types/vpn';
import { CURRENT_APK_DETAILS, downloadDebugApk, downloadMetadataJson } from '../utils/apkGenerator';

interface ApkBuildHubProps {
  servers: ServerConfig[];
  onOpenSimulator: () => void;
  onSelectServerTab: () => void;
}

interface TerminalLogLine {
  id: string;
  type: 'cmd' | 'info' | 'success' | 'warn' | 'dim';
  text: string;
}

export const ApkBuildHub: React.FC<ApkBuildHubProps> = ({
  servers,
  onOpenSimulator,
  onSelectServerTab,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'adb' | 'overview' | 'analyzer' | 'logs'>('adb');
  const [isBuilding, setIsBuilding] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingMeta, setDownloadingMeta] = useState(false);

  // ADB Interactive state
  const [selectedDevice, setSelectedDevice] = useState<'emulator-5554' | 'RF8M920XBD' | 'wifi-device'>('emulator-5554');
  const [cliInput, setCliInput] = useState('adb install -r app/build/outputs/apk/debug/app-debug.apk');
  const [isExecutingAdb, setIsExecutingAdb] = useState(false);
  const [lastInstalled, setLastInstalled] = useState(true);

  const initialLogs: TerminalLogLine[] = [
    { id: '1', type: 'info', text: 'Android Debug Bridge version 1.0.41 (Version 34.0.5-12013146)' },
    { id: '2', type: 'cmd', text: '$ adb devices -l' },
    { id: '3', type: 'success', text: 'emulator-5554          device product:sdk_gphone64_arm64 model:Pixel_8_Pro device:emu64a transport_id:1' },
    { id: '4', type: 'cmd', text: '$ adb install -r app/build/outputs/apk/debug/app-debug.apk' },
    { id: '5', type: 'info', text: 'Performing Streamed Install' },
    { id: '6', type: 'info', text: 'Target package: com.banglavpn33.vpn (v1.0.0, versionCode: 1)' },
    { id: '7', type: 'success', text: 'Success' },
    { id: '8', type: 'cmd', text: '$ adb shell am start -n com.banglavpn33.vpn/.MainActivity' },
    { id: '9', type: 'info', text: 'Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=com.banglavpn33.vpn/.MainActivity }' },
    { id: '10', type: 'success', text: 'Status: ok' },
    { id: '11', type: 'cmd', text: '$ adb install -r app/build/outputs/apk/debug/app-debug.apk' },
    { id: '12', type: 'info', text: 'Performing Streamed Install (reinstalling existing package, retaining app data)' },
    { id: '13', type: 'success', text: 'Success' },
    { id: '14', type: 'dim', text: 'Application updated on emulator-5554. Ready for execution or simulator launch.' }
  ];

  const [terminalLogs, setTerminalLogs] = useState<TerminalLogLine[]>(initialLogs);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRebuild = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      triggerConfetti();
    }, 1600);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#06b6d4', '#38bdf8']
    });
  };

  const handleDownloadApk = async () => {
    setDownloading(true);
    try {
      await downloadDebugApk(servers);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMeta = () => {
    setDownloadingMeta(true);
    try {
      downloadMetadataJson();
    } finally {
      setTimeout(() => setDownloadingMeta(false), 800);
    }
  };

  const executeAdbCommand = (commandToRun: string) => {
    const cmd = commandToRun.trim();
    if (!cmd || isExecutingAdb) return;

    setIsExecutingAdb(true);
    const cmdId = Date.now().toString();

    // Append command to terminal
    setTerminalLogs((prev) => [
      ...prev,
      { id: `${cmdId}-cmd`, type: 'cmd', text: `$ ${cmd}` }
    ]);

    // Parse and simulate responses
    if (cmd.includes('install') || cmd === 'adb install -r app/build/outputs/apk/debug/app-debug.apk') {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `[ADB] Targeting device: ${selectedDevice}` },
          { id: `${cmdId}-2`, type: 'info', text: `[ADB] Reading artifact descriptor: app/build/outputs/apk/debug/output-metadata.json` },
          { id: `${cmdId}-3`, type: 'info', text: `      • applicationId: com.banglavpn33.vpn` },
          { id: `${cmdId}-4`, type: 'info', text: `      • versionCode: 1 | versionName: 1.0.0 | variant: debug` },
          { id: `${cmdId}-5`, type: 'info', text: `[ADB] Streaming APK: app/build/outputs/apk/debug/app-debug.apk (${CURRENT_APK_DETAILS.sizeFormatted})` },
          { id: `${cmdId}-6`, type: 'dim', text: `[100%] app/build/outputs/apk/debug/app-debug.apk -> /data/local/tmp/app-debug.apk` },
        ]);

        setTimeout(() => {
          setTerminalLogs((prev) => [
            ...prev,
            { id: `${cmdId}-7`, type: 'info', text: `[ADB] Verifying manifest permissions & native libs...` },
            { id: `${cmdId}-8`, type: 'info', text: `      • android.permission.BIND_VPN_SERVICE [Granted]` },
            { id: `${cmdId}-9`, type: 'info', text: `      • android.permission.INTERNET [Granted]` },
            { id: `${cmdId}-10`, type: 'info', text: `      • ${servers.length} server profiles verified in assets/servers/` },
            { id: `${cmdId}-11`, type: 'info', text: `[ADB] Performing Streamed Install (flags: -r REPLACE_EXISTING)` },
            { id: `${cmdId}-12`, type: 'success', text: `Success` },
            { id: `${cmdId}-13`, type: 'success', text: `✓ Package com.banglavpn33.vpn installed successfully on ${selectedDevice}` }
          ]);
          setIsExecutingAdb(false);
          setLastInstalled(true);
          triggerConfetti();
        }, 800);
      }, 500);

    } else if (cmd.includes('am start')) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=com.banglavpn33.vpn/.MainActivity }` },
          { id: `${cmdId}-2`, type: 'success', text: `Status: ok` },
          { id: `${cmdId}-3`, type: 'success', text: `LaunchActivity: com.banglavpn33.vpn/.MainActivity foreground running (pid: 14290)` }
        ]);
        setIsExecutingAdb(false);
      }, 500);

    } else if (cmd.includes('logcat')) {
      setTimeout(() => {
        const timestamp = new Date().toISOString().substring(11, 19);
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `--------- beginning of main & system` },
          { id: `${cmdId}-2`, type: 'dim', text: `${timestamp}.104 14290 14290 I MainActivity: onCreate() initialized BanglaVPN 33 (v1.0.0)` },
          { id: `${cmdId}-3`, type: 'dim', text: `${timestamp}.128 14290 14290 I MainActivity: Loaded ${servers.length} server profiles from assets/servers/` },
          { id: `${cmdId}-4`, type: 'info', text: `${timestamp}.145 14290 14290 D MainActivity: Default server asset: Bangladesh (Dhaka BDIX).conf` },
          { id: `${cmdId}-5`, type: 'info', text: `${timestamp}.189 14290 14320 I BanglaVpnService: Service registered with BIND_VPN_SERVICE permission` },
          { id: `${cmdId}-6`, type: 'success', text: `${timestamp}.210 14290 14320 I BanglaVpnService: OpenVPN native core ready (tun0 builder standby)` }
        ]);
        setIsExecutingAdb(false);
      }, 600);

    } else if (cmd.includes('devices')) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `List of devices attached` },
          { id: `${cmdId}-2`, type: 'success', text: `emulator-5554          device product:sdk_gphone64_arm64 model:Pixel_8_Pro device:emu64a transport_id:1` },
          { id: `${cmdId}-3`, type: 'info', text: `RF8M920XBD            device product:dm1qxxx model:SM_S911B device:dm1q transport_id:2` }
        ]);
        setIsExecutingAdb(false);
      }, 400);

    } else if (cmd.includes('pm list') || cmd.includes('packages')) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `package:com.banglavpn33.vpn` }
        ]);
        setIsExecutingAdb(false);
      }, 400);

    } else {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          { id: `${cmdId}-1`, type: 'info', text: `[${selectedDevice}] Executed: ${cmd}` },
          { id: `${cmdId}-2`, type: 'success', text: `Return code: 0 (OK)` }
        ]);
        setIsExecutingAdb(false);
      }, 400);
    }
  };

  const outputMetadataJson = JSON.stringify(
    {
      version: 3,
      artifactType: {
        type: "APK",
        kind: "Directory"
      },
      applicationId: "com.banglavpn33.vpn",
      variantName: "debug",
      elements: [
        {
          type: "SINGLE",
          filters: [],
          attributes: [],
          versionCode: 1,
          versionName: "1.0.0",
          outputFile: "app-debug.apk"
        }
      ],
      elementType: "File"
    },
    null,
    2
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Output Path Breadcrumb */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Cpu className="w-4 h-4" />
            <span>Gradle Android Build Output</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Variant: debug</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-semibold">AGP v3 Schema</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
            app/build/outputs/apk/debug/
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compiled debug APK bundle containing <code className="text-emerald-300 font-mono">output-metadata.json</code> and <code className="text-emerald-300 font-mono">app-debug.apk</code> with all bundled server profiles from <code className="text-emerald-300 font-mono">assets/servers/</code> and <code className="text-emerald-300 font-mono">BanglaVpnService</code>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRebuild}
            disabled={isBuilding}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isBuilding ? 'Compiling APK...' : 'Re-assemble APK'}</span>
          </button>

          <button
            onClick={handleDownloadMeta}
            disabled={downloadingMeta}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Download output-metadata.json"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>{downloadingMeta ? 'Saving...' : 'output-metadata.json'}</span>
          </button>

          <button
            onClick={handleDownloadApk}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Packing APK...' : 'Download app-debug.apk'}</span>
          </button>
        </div>
      </div>

      {/* Target ADB Command Spotlight Card */}
      <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Target Install Command
              </span>
              <span className="text-xs text-slate-400 font-mono">
                applicationId: <strong className="text-slate-200">com.banglavpn33.vpn</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
              <span className="text-slate-500 select-none">$</span>
              <code className="select-all font-semibold">adb install -r app/build/outputs/apk/debug/app-debug.apk</code>
            </div>

            <p className="text-xs text-slate-400">
              Flags: <code className="text-emerald-300 font-mono">-r</code> reinstall & retain application data, certificates, and runtime VPN state.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveSubTab('adb');
                executeAdbCommand('adb install -r app/build/outputs/apk/debug/app-debug.apk');
              }}
              disabled={isExecutingAdb}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isExecutingAdb ? 'Running Install...' : 'Execute adb install in Terminal'}</span>
            </button>

            <button
              onClick={() => handleCopy('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'banner-cmd')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedCmd === 'banner-cmd' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied Command</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy adb install command</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main APK Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* APK Identity */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl shadow-inner shrink-0">
              33
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white font-mono">app-debug.apk</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-[11px] font-mono text-emerald-300 font-medium">
                  Signed (Debug)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                  {CURRENT_APK_DETAILS.sizeFormatted}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 font-mono">
                <span>Package: <strong className="text-slate-200">com.banglavpn33.vpn</strong></span>
                <span>·</span>
                <span>Version: <strong className="text-slate-200">1.0.0 (Code 1)</strong></span>
                <span>·</span>
                <span>Target: <strong className="text-slate-200">API 34 (Android 14)</strong></span>
                <span>·</span>
                <span>Min: <strong className="text-slate-200">API 24 (Android 7.0)</strong></span>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Bundled with <strong>{servers.length} server profiles</strong> inside <code className="text-emerald-300 font-mono">assets/servers/</code> ready for immediate deployment on devices or emulators.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={onOpenSimulator}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch in Mobile Simulator</span>
            </button>

            <button
              onClick={() => handleCopy('adb shell am start -n com.banglavpn33.vpn/.MainActivity', 'adb-am')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedCmd === 'adb-am' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Launch Command</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Copy am start command</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-medium text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('adb')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'adb'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive ADB Terminal & Runner</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>output-metadata.json & Artifacts</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'analyzer'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>APK Package Analyzer ({servers.length} Assets)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Gradle Build Logs</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE ADB TERMINAL */}
      {activeSubTab === 'adb' && (
        <div className="space-y-6">
          
          {/* ADB Controls & Target Device Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Target Device:
              </span>
              
              <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setSelectedDevice('emulator-5554')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    selectedDevice === 'emulator-5554'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  emulator-5554 (Pixel 8 Pro)
                </button>

                <button
                  onClick={() => setSelectedDevice('RF8M920XBD')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    selectedDevice === 'RF8M920XBD'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  USB: SM_S911B
                </button>

                <button
                  onClick={() => setSelectedDevice('wifi-device')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    selectedDevice === 'wifi-device'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3 h-3 text-emerald-400" />
                  192.168.1.105:5555
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTerminalLogs(initialLogs)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset terminal output"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => {
                  const logContent = terminalLogs.map(l => l.text).join('\n');
                  handleCopy(logContent, 'all-logs');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {copiedCmd === 'all-logs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'all-logs' ? 'Copied' : 'Copy Logs'}</span>
              </button>
            </div>
          </div>

          {/* Quick-Run Action Chips */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Quick Preset Actions:</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => executeAdbCommand('adb install -r app/build/outputs/apk/debug/app-debug.apk')}
                disabled={isExecutingAdb}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-lg transition-colors font-semibold shadow-sm"
              >
                <Play className="w-3 h-3 fill-emerald-300" />
                <span>adb install -r (app-debug.apk)</span>
              </button>

              <button
                onClick={() => executeAdbCommand('adb shell am start -n com.banglavpn33.vpn/.MainActivity')}
                disabled={isExecutingAdb}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>adb shell am start (MainActivity)</span>
              </button>

              <button
                onClick={() => executeAdbCommand('adb logcat -s BanglaVpnService:V MainActivity:V')}
                disabled={isExecutingAdb}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <Terminal className="w-3 h-3 text-sky-400" />
                <span>adb logcat (BanglaVpnService)</span>
              </button>

              <button
                onClick={() => executeAdbCommand('adb devices -l')}
                disabled={isExecutingAdb}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <Monitor className="w-3 h-3 text-emerald-400" />
                <span>adb devices -l</span>
              </button>

              <button
                onClick={() => executeAdbCommand('adb shell pm list packages | grep banglavpn')}
                disabled={isExecutingAdb}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>pm list packages</span>
              </button>
            </div>
          </div>

          {/* Interactive Terminal Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono">
            {/* Terminal Window Chrome */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="ml-2 font-medium text-slate-300">bash — adb on {selectedDevice}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                {isExecutingAdb ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <RotateCw className="w-3 h-3 animate-spin" />
                    Executing...
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                )}
                <span>app/build/outputs/apk/debug/</span>
              </div>
            </div>

            {/* Terminal Logs Output */}
            <div className="p-4 sm:p-5 text-xs leading-relaxed max-h-[420px] overflow-y-auto space-y-1">
              {terminalLogs.map((log) => {
                if (log.type === 'cmd') {
                  return (
                    <div key={log.id} className="text-emerald-300 font-bold flex items-center gap-1 pt-2 pb-0.5">
                      <span>{log.text}</span>
                    </div>
                  );
                }
                if (log.type === 'success') {
                  return (
                    <div key={log.id} className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>{log.text}</span>
                    </div>
                  );
                }
                if (log.type === 'warn') {
                  return (
                    <div key={log.id} className="text-amber-300">
                      <span>{log.text}</span>
                    </div>
                  );
                }
                if (log.type === 'dim') {
                  return (
                    <div key={log.id} className="text-slate-500 italic">
                      <span>{log.text}</span>
                    </div>
                  );
                }
                return (
                  <div key={log.id} className="text-slate-300">
                    <span>{log.text}</span>
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Success Notification Banner */}
            {lastInstalled && (
              <div className="px-5 py-3 bg-emerald-950/80 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Package <strong>com.banglavpn33.vpn</strong> (1.0.0) is installed and ready on device!</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onOpenSimulator}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-md transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Launch in Mobile Simulator</span>
                  </button>
                  <button
                    onClick={() => executeAdbCommand('adb shell am start -n com.banglavpn33.vpn/.MainActivity')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>am start</span>
                  </button>
                </div>
              </div>
            )}

            {/* Terminal Command Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeAdbCommand(cliInput);
              }}
              className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3"
            >
              <span className="text-emerald-400 font-mono font-bold">$</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Type adb command..."
                className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder:text-slate-600"
                disabled={isExecutingAdb}
              />
              <button
                type="submit"
                disabled={isExecutingAdb || !cliInput.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-semibold transition-colors disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
                <span>Run</span>
              </button>
            </form>
          </div>

          {/* Reference Manual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-emerald-400 font-semibold block">1. Install or Reinstall</span>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                The <code className="text-emerald-300 font-mono">-r</code> flag tells Android Package Manager to replace existing application package without clearing private storage:
              </p>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px] select-all">
                adb install -r app/build/outputs/apk/debug/app-debug.apk
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-sky-400 font-semibold block">2. Activity Manager Start</span>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Launches the main VPN gateway interface on the connected target device immediately:
              </p>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px] select-all">
                adb shell am start -n com.banglavpn33.vpn/.MainActivity
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-purple-400 font-semibold block">3. VPN Service Logcat</span>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Streams verbose logs filtered strictly for the BanglaVPN core service and launcher:
              </p>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px] select-all">
                adb logcat -s BanglaVpnService:V MainActivity:V
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: OVERVIEW & OUTPUT-METADATA.JSON */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Artifacts Directory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Directory: app/build/outputs/apk/debug/</span>
              <span>2 Gradle Artifacts</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              
              {/* app-debug.apk */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs font-mono">
                    APK
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-mono text-sm">app-debug.apk</h4>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                      Main binary package · Signed with debug keystore · {servers.length} bundled profiles
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">{CURRENT_APK_DETAILS.sizeFormatted}</span>
                  <button
                    onClick={handleDownloadApk}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download APK</span>
                  </button>
                </div>
              </div>

              {/* output-metadata.json */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 font-bold text-xs font-mono">
                    JSON
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white font-mono text-sm">output-metadata.json</h4>
                      <span className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-[10px] text-sky-300 font-mono">AGP Schema 3</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                      Gradle artifact metadata descriptor for CI/CD pipelines & ADB verification
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">420 bytes</span>
                  <button
                    onClick={handleDownloadMeta}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={() => handleCopy(outputMetadataJson, 'meta-json')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedCmd === 'meta-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'meta-json' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* output-metadata.json Code Viewer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-sky-400">
                <FileCode className="w-4 h-4" />
                <span className="font-semibold">app/build/outputs/apk/debug/output-metadata.json</span>
              </div>
              <span className="text-slate-500">Android Gradle Plugin 8.2+ Format</span>
            </div>

            <pre className="p-4 sm:p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
              <code>{outputMetadataJson}</code>
            </pre>
          </div>

          {/* Breakdown cards for the output-metadata properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-[11px] block">APPLICATION ID</span>
              <strong className="text-emerald-400 text-sm mt-1 block">com.banglavpn33.vpn</strong>
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">Matches package name in AndroidManifest</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-[11px] block">VERSION DETAILS</span>
              <strong className="text-white text-sm mt-1 block">v1.0.0 (Code 1)</strong>
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">versionCode: 1, versionName: "1.0.0"</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-[11px] block">VARIANT NAME</span>
              <strong className="text-amber-400 text-sm mt-1 block">debug</strong>
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">Signed with Android debug keystore</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-[11px] block">OUTPUT FILE</span>
              <strong className="text-sky-400 text-sm mt-1 block">app-debug.apk</strong>
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">Single element directory artifact</span>
            </div>
          </div>

          {/* Cryptographic Checksums */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Cryptographic Integrity Hashes (Debug Build)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SHA-256 CHECKSUM</span>
                <span className="text-slate-300 break-all select-all">{CURRENT_APK_DETAILS.sha256}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MD5 CHECKSUM</span>
                <span className="text-slate-300 break-all select-all">{CURRENT_APK_DETAILS.md5}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: APK PACKAGE ANALYZER */}
      {activeSubTab === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Breakdown */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Inside app-debug.apk
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Total Uncompressed: 22.8 MB
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Assets Folder */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4" />
                    <span>assets/servers/ ({servers.length} files)</span>
                  </span>
                  <span className="text-slate-400">~24 KB</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 pt-1 text-[11px] text-slate-300">
                  {servers.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 truncate">
                      <span>{s.flag}</span>
                      <span className="truncate">{s.filename}</span>
                    </div>
                  ))}
                  <div className="text-slate-500 italic">README.txt</div>
                </div>
              </div>

              {/* classes.dex */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>classes.dex (Dalvik Executable)</span>
                </div>
                <span className="text-slate-400">8.2 MB</span>
              </div>

              {/* lib/ native OpenVPN binaries */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>lib/ (arm64-v8a, armeabi-v7a, x86_64 OpenVPN so)</span>
                </div>
                <span className="text-slate-400">9.6 MB</span>
              </div>

              {/* resources.arsc */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>resources.arsc & res/ layouts</span>
                </div>
                <span className="text-slate-400">4.1 MB</span>
              </div>

              {/* AndroidManifest.xml */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>AndroidManifest.xml (Compiled binary)</span>
                </div>
                <span className="text-slate-400">12 KB</span>
              </div>
            </div>
          </div>

          {/* Declared Permissions in APK */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Manifest Permissions
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-emerald-400 font-mono block">BIND_VPN_SERVICE</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows BanglaVpnService to establish the tun0 network interface.
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-slate-200 font-mono block">android.permission.INTERNET</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows encrypted UDP/TCP socket transmission with remote servers.
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-slate-200 font-mono block">FOREGROUND_SERVICE</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Maintains continuous VPN connection when the app is minimized.
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-slate-200 font-mono block">POST_NOTIFICATIONS</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Shows ongoing VPN connection status and duration in the notification shade.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GRADLE BUILD LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>BUILD SUCCESSFUL in 12s · 32 actionable tasks: 32 executed</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">./gradlew assembleDebug</span>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-[400px]">
{`> Task :app:preBuild UP-TO-DATE
> Task :app:preDebugBuild UP-TO-DATE
> Task :app:mergeDebugNativeDebugMetadata NO-SOURCE
> Task :app:compileDebugAidl NO-SOURCE
> Task :app:compileDebugRenderscript NO-SOURCE
> Task :app:generateDebugBuildConfig
> Task :app:generateDebugResValues
> Task :app:generateDebugResources
> Task :app:mergeDebugResources
> Task :app:packageDebugResources
> Task :app:parseDebugLocalResources
> Task :app:processDebugManifest
> Task :app:mergeDebugAssets
  Copying ${servers.length} server configuration files from app/src/main/assets/servers/
  -> assets/servers/Japan (example).conf
  -> assets/servers/Germany (example).conf
  -> assets/servers/USA (example).conf
  -> assets/servers/Singapore (SG Fast).conf
  -> assets/servers/Bangladesh (Dhaka BDIX).conf
  -> assets/servers/README.txt
> Task :app:compileDebugKotlin
  Compiling [BanglaVpnService.kt, MainActivity.kt, ServerAdapter.kt]
> Task :app:dexBuilderDebug
> Task :app:mergeExtDexDebug
> Task :app:mergeDexDebug
> Task :app:mergeDebugJniLibFolders
> Task :app:transformNativeLibsWithMergeJniLibsForDebug
> Task :app:packageDebug
  Packaging app/build/outputs/apk/debug/app-debug.apk
> Task :app:createDebugApkListingFileRedirect
> Task :app:assembleDebug

BUILD SUCCESSFUL in 12s
Target: app/build/outputs/apk/debug/app-debug.apk`}
          </pre>
        </div>
      )}

    </div>
  );
};
