import React, { useState } from 'react';
import { Copy, Check, FileCode, FolderTree, Info, ExternalLink } from 'lucide-react';
import { KOTLIN_FILES } from '../data/kotlinCode';
import { README_CONTENT } from '../data/defaultServers';

export const AndroidCodeViewer: React.FC = () => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('MainActivity');
  const [copied, setCopied] = useState(false);

  const fileMap: Record<string, { filename: string; path: string; code: string; language: string }> = {
    MainActivity: {
      filename: 'MainActivity.kt',
      path: 'app/src/main/java/com/banglavpn33/vpn/MainActivity.kt',
      code: KOTLIN_FILES.MainActivity.code,
      language: 'kotlin',
    },
    BanglaVpnService: {
      filename: 'BanglaVpnService.kt',
      path: 'app/src/main/java/com/banglavpn33/vpn/BanglaVpnService.kt',
      code: KOTLIN_FILES.BanglaVpnService.code,
      language: 'kotlin',
    },
    ServerAdapter: {
      filename: 'ServerAdapter.kt',
      path: 'app/src/main/java/com/banglavpn33/vpn/ServerAdapter.kt',
      code: KOTLIN_FILES.ServerAdapter.code,
      language: 'kotlin',
    },
    AndroidManifest: {
      filename: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      code: KOTLIN_FILES.AndroidManifest.code,
      language: 'xml',
    },
    Readme: {
      filename: 'README.txt',
      path: 'app/src/main/assets/servers/README.txt',
      code: README_CONTENT,
      language: 'markdown',
    }
  };

  const currentFile = fileMap[selectedFileKey] || fileMap.MainActivity;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = currentFile.code.split('\n');

  return (
    <div className="space-y-6">
      
      {/* Intro info box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              BanglaVpn33 Android Implementation Details
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              In BanglaVpn33, servers are placed in <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code>.
              The Android app calls <code className="text-emerald-300 font-mono">assets.list("servers")</code> at boot, dynamically builds the server selection list, and injects the raw config into Android's native <code className="text-emerald-300 font-mono">VpnService</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
            <span>Project Files</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase px-2 pt-2">
              Kotlin Service & Activity
            </div>
            
            <button
              onClick={() => setSelectedFileKey('MainActivity')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono transition-colors ${
                selectedFileKey === 'MainActivity'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">MainActivity.kt</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedFileKey('BanglaVpnService')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono transition-colors ${
                selectedFileKey === 'BanglaVpnService'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">BanglaVpnService.kt</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedFileKey('ServerAdapter')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono transition-colors ${
                selectedFileKey === 'ServerAdapter'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">ServerAdapter.kt</span>
              </div>
            </button>

            <div className="text-[11px] font-mono text-slate-500 uppercase px-2 pt-3">
              Android Resources
            </div>

            <button
              onClick={() => setSelectedFileKey('AndroidManifest')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono transition-colors ${
                selectedFileKey === 'AndroidManifest'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">AndroidManifest.xml</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedFileKey('Readme')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-mono transition-colors ${
                selectedFileKey === 'Readme'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">README.txt (Assets)</span>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 block">Android Setup Tip:</span>
            <p>
              To add new servers to your Android Studio build, copy your `.conf` files to:
            </p>
            <code className="block p-2 bg-slate-950 rounded text-emerald-300 font-mono text-[10px] break-all border border-slate-800">
              BanglaVpn33/app/src/main/assets/servers/
            </code>
          </div>
        </div>

        {/* Right Area: Code Display */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white font-mono">
                {currentFile.filename}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currentFile.path}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code view */}
          <div className="p-4 bg-slate-950 overflow-auto font-mono text-xs flex max-h-[600px]">
            <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 leading-relaxed font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <pre className="pl-4 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
              <code>{currentFile.code}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
