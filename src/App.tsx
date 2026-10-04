import React, { useState } from 'react';
import { INITIAL_SERVERS } from './data/defaultServers';
import { ServerConfig, VpnConnectionStatus, VpnStats } from './types/vpn';
import { Navbar, NavTab } from './components/Navbar';
import { ServerList } from './components/ServerList';
import { MobileSimulator } from './components/MobileSimulator';
import { ConfigEditorModal } from './components/ConfigEditorModal';
import { NewServerModal } from './components/NewServerModal';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';
import { ServerHealthProbe } from './components/ServerHealthProbe';
import { ApkBuildHub } from './components/ApkBuildHub';
import { WireguardScriptViewer } from './components/WireguardScriptViewer';
import { WgServerConfigViewer } from './components/WgServerConfigViewer';
import { IpCheckTool } from './components/IpCheckTool';
import { FlagshipTrioViewer } from './components/FlagshipTrioViewer';
import { ConnectionLogs } from './components/ConnectionLogs';
import { exportServersZip } from './utils/zipExport';
import { FolderCheck, Smartphone, Check, Download, PackageCheck, Terminal, Server, Globe, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [servers, setServers] = useState<ServerConfig[]>(INITIAL_SERVERS);
  const [selectedServer, setSelectedServer] = useState<ServerConfig>(INITIAL_SERVERS[4]); // Defaults to Bangladesh (Dhaka BDIX)
  const [activeTab, setActiveTab] = useState<NavTab>('apk');
  const [isNewServerModalOpen, setIsNewServerModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // VPN Connection simulation states
  const [status, setStatus] = useState<VpnConnectionStatus>('disconnected');
  const [stats, setStats] = useState<VpnStats>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 14.5,
    totalUploaded: 3.2,
    connectedDuration: 0,
    assignedIp: '10.8.0.2',
    ping: selectedServer.ping,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportZip = async () => {
    try {
      await exportServersZip(servers);
      showToast('Exported BanglaVpn33_assets_servers.zip with all .conf profiles!');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate ZIP archive.');
    }
  };

  const handleAddServer = (newServer: ServerConfig) => {
    setServers((prev) => [newServer, ...prev]);
    setSelectedServer(newServer);
    showToast(`Added ${newServer.filename} to assets/servers!`);
  };

  const handleDeleteServer = (id: string) => {
    setServers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (selectedServer.id === id && updated.length > 0) {
        setSelectedServer(updated[0]);
      }
      return updated;
    });
    showToast('Server configuration removed from assets.');
  };

  const handleSaveConfig = (updated: ServerConfig) => {
    setServers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedServer.id === updated.id) {
      setSelectedServer(updated);
    }
    setEditingServer(null);
    showToast(`Updated ${updated.filename} configuration!`);
  };

  const handleSelectAndSimulate = (server: ServerConfig) => {
    setSelectedServer(server);
    setStats((prev) => ({ ...prev, ping: server.ping }));
    setActiveTab('simulator');
  };

  const handleToggleConnection = () => {
    if (status === 'disconnected') {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('authenticating');
        setTimeout(() => {
          setStatus('assigning_ip');
          setTimeout(() => {
            setStatus('connected');
            setStats((prev) => ({
              ...prev,
              downloadSpeed: 1420,
              uploadSpeed: 410,
              assignedIp: selectedServer.countryCode === 'BD' ? '103.134.58.109' : '10.66.66.6',
            }));
          }, 600);
        }, 800);
      }, 700);
    } else {
      setStatus('disconnected');
      setStats((prev) => ({
        ...prev,
        downloadSpeed: 0,
        uploadSpeed: 0,
        connectedDuration: 0,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navbar with 3-Zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewServerModal={() => setIsNewServerModalOpen(true)}
        onExportZip={handleExportZip}
        serverCount={servers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'trio' && (
          <FlagshipTrioViewer
            servers={servers}
            onSelectAndSimulate={handleSelectAndSimulate}
            onGoToAssets={() => setActiveTab('servers')}
          />
        )}

        {activeTab === 'ip-check' && (
          <IpCheckTool
            vpnStatus={status}
            selectedServer={selectedServer}
            onOpenSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'wg-conf' && (
          <WgServerConfigViewer
            onGoToAssets={() => setActiveTab('servers')}
            onGoToApk={() => setActiveTab('apk')}
            onAddServerAsset={handleAddServer}
          />
        )}

        {activeTab === 'wg-setup' && (
          <WireguardScriptViewer
            onGoToAssets={() => setActiveTab('servers')}
            onGoToApk={() => setActiveTab('apk')}
          />
        )}

        {activeTab === 'servers' && (
          <ServerList
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
            onOpenConfigEditor={(srv) => setEditingServer(srv)}
            onDeleteServer={handleDeleteServer}
            onOpenSimulator={handleSelectAndSimulate}
            onOpenNewServerModal={() => setIsNewServerModalOpen(true)}
            onUpdateServerConfig={handleSaveConfig}
          />
        )}

        {activeTab === 'apk' && (
          <ApkBuildHub
            servers={servers}
            onOpenSimulator={() => setActiveTab('simulator')}
            onSelectServerTab={() => setActiveTab('servers')}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Interactive Android UI</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                BanglaVpn33 Mobile App Simulator
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Running <code className="text-emerald-300 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>. Simulates how <code className="text-emerald-300 font-mono">MainActivity.kt</code> and <code className="text-emerald-300 font-mono">BanglaVpnService.kt</code> load and connect to configurations stored in <code className="text-emerald-300 font-mono">app/src/main/assets/servers/</code>.
              </p>
            </div>

            <MobileSimulator
              servers={servers}
              selectedServer={selectedServer}
              onSelectServer={(srv) => {
                setSelectedServer(srv);
                setStats((prev) => ({ ...prev, ping: srv.ping }));
              }}
              status={status}
              setStatus={setStatus}
              stats={stats}
              setStats={setStats}
              onOpenLogs={() => setActiveTab('logs')}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <ConnectionLogs
            selectedServer={selectedServer}
            servers={servers}
            onSelectServer={(srv) => {
              setSelectedServer(srv);
              setStats((prev) => ({ ...prev, ping: srv.ping }));
            }}
            status={status}
            onToggleConnection={handleToggleConnection}
            stats={stats}
          />
        )}

        {activeTab === 'code' && <AndroidCodeViewer />}

        {activeTab === 'probe' && (
          <ServerHealthProbe
            servers={servers}
            onSelectServer={setSelectedServer}
            onOpenSimulator={handleSelectAndSimulate}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">BanglaVPN 33</span>
            <span>·</span>
            <span>Flagship Trio Profiles</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">Japan · Singapore · Bangladesh BDIX</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('trio')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flagship Trio</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setActiveTab('servers')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
            >
              <FolderCheck className="w-3.5 h-3.5" />
              <span>assets/servers</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setActiveTab('apk')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>app-debug.apk</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setActiveTab('logs')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connection Logs</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Config Editor Modal */}
      {editingServer && (
        <ConfigEditorModal
          server={editingServer}
          isOpen={!!editingServer}
          onClose={() => setEditingServer(null)}
          onSave={handleSaveConfig}
        />
      )}

      {/* New Server Modal */}
      <NewServerModal
        isOpen={isNewServerModalOpen}
        onClose={() => setIsNewServerModalOpen(false)}
        onAddServer={handleAddServer}
      />

    </div>
  );
}
