import JSZip from 'jszip';
import { ServerConfig } from '../types/vpn';
import { README_CONTENT } from '../data/defaultServers';

export async function exportServersZip(servers: ServerConfig[]) {
  const zip = new JSZip();

  // Create standard Android asset folder structure
  const assetsFolder = zip.folder('app/src/main/assets/servers');
  if (!assetsFolder) return;

  // Add README.txt
  assetsFolder.file('README.txt', README_CONTENT);

  // Add all server .conf files
  servers.forEach(server => {
    assetsFolder.file(server.filename, server.rawConfig);
  });

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BanglaVpn33_assets_servers.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleConfigFile(server: ServerConfig) {
  const blob = new Blob([server.rawConfig], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = server.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportCustomServersZip(servers: ServerConfig[], zipName = 'BanglaVPN33_Trio.zip') {
  const zip = new JSZip();
  const assetsFolder = zip.folder('app/src/main/assets/servers');
  if (!assetsFolder) return;

  assetsFolder.file('README.txt', README_CONTENT);
  servers.forEach(server => {
    assetsFolder.file(server.filename, server.rawConfig);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

