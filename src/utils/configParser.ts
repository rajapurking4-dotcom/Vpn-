import { ServerConfig } from '../types/vpn';

export function parseConfigFile(filename: string, content: string): Partial<ServerConfig> {
  let host = '127.0.0.1';
  let port = 1194;
  let protocol: 'udp' | 'tcp' = 'udp';
  let cipher: ServerConfig['cipher'] = 'AES-256-GCM';
  let authType: ServerConfig['authType'] = 'user-pass';

  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;

    const parts = line.split(/\s+/);
    const directive = parts[0]?.toLowerCase();

    if (directive === 'remote' && parts[1]) {
      host = parts[1];
      if (parts[2] && !isNaN(parseInt(parts[2]))) {
        port = parseInt(parts[2]);
      }
    } else if (directive === 'port' && parts[1] && !isNaN(parseInt(parts[1]))) {
      port = parseInt(parts[1]);
    } else if (directive === 'proto' && parts[1]) {
      const p = parts[1].toLowerCase();
      protocol = p.includes('tcp') ? 'tcp' : 'udp';
    } else if (directive === 'cipher' && parts[1]) {
      const c = parts[1].toUpperCase();
      if (c.includes('CHACHA20')) cipher = 'CHACHA20-POLY1305';
      else if (c.includes('128')) cipher = 'AES-128-GCM';
      else cipher = 'AES-256-GCM';
    }
  }

  if (content.includes('<ca>') && content.includes('<key>')) {
    authType = 'inline-cert';
  } else if (content.includes('auth-user-pass')) {
    authType = 'user-pass';
  }

  // Guess country from filename or host
  let country = 'Global';
  let countryCode = 'UN';
  let flag = '🌐';
  const lowerName = filename.toLowerCase();

  if (lowerName.includes('japan') || lowerName.includes('tokyo') || lowerName.includes('jp')) {
    country = 'Japan';
    countryCode = 'JP';
    flag = '🇯🇵';
  } else if (lowerName.includes('germany') || lowerName.includes('frankfurt') || lowerName.includes('de')) {
    country = 'Germany';
    countryCode = 'DE';
    flag = '🇩🇪';
  } else if (lowerName.includes('usa') || lowerName.includes('united states') || lowerName.includes('us')) {
    country = 'United States';
    countryCode = 'US';
    flag = '🇺🇸';
  } else if (lowerName.includes('singapore') || lowerName.includes('sg')) {
    country = 'Singapore';
    countryCode = 'SG';
    flag = '🇸🇬';
  } else if (lowerName.includes('bangladesh') || lowerName.includes('dhaka') || lowerName.includes('bd')) {
    country = 'Bangladesh';
    countryCode = 'BD';
    flag = '🇧🇩';
  } else if (lowerName.includes('uk') || lowerName.includes('london') || lowerName.includes('britain')) {
    country = 'United Kingdom';
    countryCode = 'GB';
    flag = '🇬🇧';
  } else if (lowerName.includes('netherlands') || lowerName.includes('amsterdam') || lowerName.includes('nl')) {
    country = 'Netherlands';
    countryCode = 'NL';
    flag = '🇳🇱';
  }

  return {
    filename,
    host,
    port,
    protocol,
    cipher,
    authType,
    country,
    countryCode,
    flag,
    rawConfig: content,
  };
}

export function generateOpenVpnConfig(params: {
  filename: string;
  host: string;
  port: number;
  protocol: 'udp' | 'tcp';
  cipher: string;
  dns: string;
  bdixOptimized?: boolean;
  useCredentials?: boolean;
}): string {
  const dnsOptions = params.dns.split(',').map(d => `dhcp-option DNS ${d.trim()}`).join('\n');
  
  return `# BanglaVPN 33 Configuration File
# Target: app/src/main/assets/servers/${params.filename}
client
dev tun
proto ${params.protocol}
remote ${params.host} ${params.port}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher ${params.cipher}
auth SHA256
verb 3
keepalive 10 60
${dnsOptions}
redirect-gateway def1
${params.bdixOptimized ? '# BDIX Direct Peering Optimization\nroute 103.0.0.0 255.0.0.0 net_gateway\nroute 103.134.0.0 255.255.0.0 net_gateway' : ''}
${params.useCredentials ? 'auth-user-pass' : ''}

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
MDAwWhcNMzQwMTAxMDAwMDAwWjAiMSAwHgYDVQQDDBdCYW5nbGFWUE4zMyBSb290
IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx4P5F3rVbV3k4qW9
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDVDCCAjygAwIBAgIUZK123456789abcdefghij0k1l2mMA0GCSqGSIb3DQEBCw
UAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAwMDAw
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHh/kXetVtXeTq
-----END PRIVATE KEY-----
</key>
`;
}
