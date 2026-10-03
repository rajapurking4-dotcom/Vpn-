import React, { useState } from 'react';
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
  RotateCw
} from 'lucide-react';
import { ServerConfig } from '../types/vpn';
import { CURRENT_APK_DETAILS, downloadDebugApk } from '../utils/apkGenerator';

interface ApkBuildHubProps {
  servers: ServerConfig[];
  onOpenSimulator: () => void;
  onSelectServerTab: () => void;
}

export const ApkBuildHub: React.FC<ApkBuildHubProps> = ({
  servers,
  onOpenSimulator,
  onSelectServerTab,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'analyzer' | 'adb' | 'logs'>('overview');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRebuild = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      setBuildSuccess(true);
    }, 1800);
  };

  const handleDownloadApk = async () => {
    setDownloading(true);
    try {
      await downloadDebugApk(servers);
    } finally {
      setDownloading(false);
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
      
      {/* Path Breadcrumb & Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <Cpu className="w-4 h-4" />
            <span>Gradle Android Build Output</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Variant: debug</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
            app/build/outputs/apk/debug/
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compiled Android Debug package containing all bundled server profiles from <code className="text-emerald-300 font-mono">assets/servers/</code>, native OpenVPN daemon binaries, and Android <code className="text-emerald-300 font-mono">VpnService</code>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRebuild}
            disabled={isBuilding}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isBuilding ? 'Compiling APK...' : 'Re-assemble APK'}</span>
          </button>

          <button
            onClick={handleDownloadApk}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Preparing APK...' : 'Download app-debug.apk'}</span>
          </button>
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
              <span>Launch in Android Simulator</span>
            </button>

            <button
              onClick={() => handleCopy('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'adb-install')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedCmd === 'adb-install' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied ADB Command</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Copy adb install command</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Output Files & Hashes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'analyzer'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>APK Package Analyzer ({servers.length} Assets)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adb')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'adb'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>ADB Install & CLI Commands</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'logs'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Gradle Build Logs</span>
        </button>
      </div>

      {/* Tab 1: Overview & Output Files */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Directory: app/build/outputs/apk/debug/</span>
              <span>2 Artifact Files</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {/* app-debug.apk */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
                    APK
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-mono">app-debug.apk</h4>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                      Main binary package · Signed with debug keystore
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">{CURRENT_APK_DETAILS.sizeFormatted}</span>
                  <button
                    onClick={handleDownloadApk}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* output-metadata.json */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0 font-bold text-xs">
                    JSON
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-mono">output-metadata.json</h4>
                    <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                      Gradle artifact metadata descriptor for CI/CD pipelines
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">420 bytes</span>
                  <button
                    onClick={() => handleCopy(outputMetadataJson, 'meta-json')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                  >
                    {copiedCmd === 'meta-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'meta-json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>
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

      {/* Tab 2: APK Package Analyzer */}
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

      {/* Tab 3: ADB Installation Commands */}
      {activeSubTab === 'adb' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">ADB (Android Debug Bridge) Installation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Android phone via USB or Wireless Debugging to install this APK directly from the terminal.
            </p>
          </div>

          <div className="space-y-4">
            {/* Command 1: Install */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                <span>1. Install or Reinstall APK onto connected device:</span>
                <button
                  onClick={() => handleCopy('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'cmd-install')}
                  className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
                >
                  {copiedCmd === 'cmd-install' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-install' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <code>adb install -r app/build/outputs/apk/debug/app-debug.apk</code>
              </pre>
            </div>

            {/* Command 2: Launch */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                <span>2. Launch MainActivity immediately:</span>
                <button
                  onClick={() => handleCopy('adb shell am start -n com.banglavpn33.vpn/.MainActivity', 'cmd-launch')}
                  className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
                >
                  {copiedCmd === 'cmd-launch' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-launch' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <code>adb shell am start -n com.banglavpn33.vpn/.MainActivity</code>
              </pre>
            </div>

            {/* Command 3: Logcat filter */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                <span>3. Stream VPN connection logs:</span>
                <button
                  onClick={() => handleCopy('adb logcat -s BanglaVpnService:V MainActivity:V', 'cmd-logcat')}
                  className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1"
                >
                  {copiedCmd === 'cmd-logcat' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-logcat' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <code>adb logcat -s BanglaVpnService:V MainActivity:V</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Gradle Build Logs */}
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
