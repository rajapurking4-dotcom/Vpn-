export interface ServerConfig {
  id: string;
  filename: string; // e.g. "Japan (Tokyo).conf"
  country: string;
  city: string;
  countryCode: string; // e.g. "JP", "DE", "US", "BD", "SG"
  flag: string; // emoji or SVG
  host: string;
  port: number;
  protocol: 'udp' | 'tcp';
  cipher: 'AES-256-GCM' | 'AES-128-GCM' | 'CHACHA20-POLY1305' | 'AES-256-CBC';
  ping: number; // in ms
  load: number; // in percentage (0-100)
  rawConfig: string;
  isCustom?: boolean;
  isBdixOptimized?: boolean;
  category: 'Free' | 'VIP' | 'BDIX' | 'Streaming' | 'Gaming';
  recommendedFor?: string;
  authType: 'inline-cert' | 'user-pass' | 'both';
}

export type VpnConnectionStatus = 'disconnected' | 'connecting' | 'authenticating' | 'assigning_ip' | 'connected';

export interface VpnStats {
  downloadSpeed: number; // in KB/s
  uploadSpeed: number; // in KB/s
  totalDownloaded: number; // in MB
  totalUploaded: number; // in MB
  connectedDuration: number; // in seconds
  assignedIp: string;
  ping: number;
}
