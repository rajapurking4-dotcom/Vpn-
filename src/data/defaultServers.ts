import { ServerConfig } from '../types/vpn';

export const INITIAL_SERVERS: ServerConfig[] = [
  {
    id: 'jp-tokyo',
    filename: 'Japan (example).conf',
    country: 'Japan',
    city: 'Tokyo',
    countryCode: 'JP',
    flag: '🇯🇵',
    host: 'jp-tokyo01.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'AES-256-GCM',
    ping: 85,
    load: 42,
    category: 'Gaming',
    recommendedFor: 'Low latency gaming & Asian streaming',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - Japan Server Profile
# Placed in: app/src/main/assets/servers/Japan (example).conf
client
dev tun
proto udp
remote jp-tokyo01.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
compress lz4-v2
verb 3
mute 20
route-delay 2
dhcp-option DNS 1.1.1.1
dhcp-option DNS 1.0.0.1
redirect-gateway def1

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
WhcNMzQwMTAxMDAwMDAwWjAmMSQwIgYDVQQDDBdKYXBhbiBDbGllbnQgQXV0aGVudG
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHh/kXetVtXeTq
pb1rYn2N+9b4x8g+4a8b7c9d0e1f2g3h4i5j6VBN33k7m8n9p0q1r2s3t4u5v6w7
-----END PRIVATE KEY-----
</key>`,
  },
  {
    id: 'de-frankfurt',
    filename: 'Germany (example).conf',
    country: 'Germany',
    city: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    host: 'de-fra02.banglavpn33.net',
    port: 443,
    protocol: 'tcp',
    cipher: 'AES-256-GCM',
    ping: 135,
    load: 38,
    category: 'VIP',
    recommendedFor: 'European privacy & robust TLS camouflage',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - Germany Server Profile
# Placed in: app/src/main/assets/servers/Germany (example).conf
client
dev tun
proto tcp
remote de-fra02.banglavpn33.net 443
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA512
auth-nocache
tls-version-min 1.3
verb 3
dhcp-option DNS 9.9.9.9
dhcp-option DNS 149.112.112.112
redirect-gateway def1 bypass-dhcp

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
MDAwWhcNMzQwMTAxMDAwMDAwWjAiMSAwHgYDVQQDDBdCYW5nbGFWUE4zMyBSb290
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDUTCCAingAwIBAgIUX9a8b7c6d5e4f3g2h1i0j9k8l7mMA0GCSqGSIb3DQEBCw
UAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAwMDAw
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdeFRA9812739a
-----END PRIVATE KEY-----
</key>`,
  },
  {
    id: 'us-newyork',
    filename: 'USA (example).conf',
    country: 'United States',
    city: 'New York',
    countryCode: 'US',
    flag: '🇺🇸',
    host: 'us-nyc01.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'CHACHA20-POLY1305',
    ping: 180,
    load: 65,
    category: 'Streaming',
    recommendedFor: 'US Netflix, Hulu & Disney+ unblocking',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - USA Server Profile
# Placed in: app/src/main/assets/servers/USA (example).conf
client
dev tun
proto udp
remote us-nyc01.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher CHACHA20-POLY1305
auth SHA256
verb 3
dhcp-option DNS 8.8.8.8
dhcp-option DNS 8.8.4.4
redirect-gateway def1

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
MDAwWhcNMzQwMTAxMDAwMDAwWjAiMSAwHgYDVQQDDBdCYW5nbGFWUE4zMyBSb290
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDUDCCAh4CCQDEo+d7w2k9hDANBgkqhkiG9w0BAQsFADAhMQ8wDQYDVQQDDAZC
YW5nbGExEjAQBgNVBAoMCUJhbmdsYVZQTjAeFw0yNDAxMDEwMDAwMDBaFw0zNDAx
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYk3r4p8m2j1q0
-----END PRIVATE KEY-----
</key>`,
  },
  {
    id: 'sg-singapore',
    filename: 'Singapore (SG Fast).conf',
    country: 'Singapore',
    city: 'Jurong',
    countryCode: 'SG',
    flag: '🇸🇬',
    host: 'sg-node01.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'AES-256-GCM',
    ping: 38,
    load: 54,
    category: 'Free',
    recommendedFor: 'Lowest international latency from Bangladesh (~35-40ms)',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - Singapore Express
# Placed in: app/src/main/assets/servers/Singapore (SG Fast).conf
client
dev tun
proto udp
remote sg-node01.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
dhcp-option DNS 1.1.1.1
redirect-gateway def1

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDUjCCAhnCCQDw9u8z7x6y5TANBgkqhkiG9w0BAQsFADAhMQ8wDQYDVQQDDAZC
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7V9p2k5l8w4m1
-----END PRIVATE KEY-----
</key>`,
  },
  {
    id: 'bd-dhaka',
    filename: 'Bangladesh (Dhaka BDIX).conf',
    country: 'Bangladesh',
    city: 'Dhaka',
    countryCode: 'BD',
    flag: '🇧🇩',
    host: 'bd-dhaka-ix.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'AES-128-GCM',
    ping: 8,
    load: 22,
    category: 'BDIX',
    isBdixOptimized: true,
    recommendedFor: 'BDIX high speed caching, FTP servers & live TV',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - Bangladesh BDIX Local Node
# Placed in: app/src/main/assets/servers/Bangladesh (Dhaka BDIX).conf
client
dev tun
proto udp
remote bd-dhaka-ix.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-128-GCM
auth SHA256
verb 3
# BDIX Routing optimization
dhcp-option DNS 103.134.58.18
dhcp-option DNS 1.1.1.1
redirect-gateway def1

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDUjCCAhnCCQDw9u8z7x6y5TANBgkqhkiG9w0BAQsFADAhMQ8wDQYDVQQDDAZC
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7V9p2k5l8w4m1
-----END PRIVATE KEY-----
</key>`,
  },
  {
    id: 'uk-london',
    filename: 'United Kingdom (London).conf',
    country: 'United Kingdom',
    city: 'London',
    countryCode: 'GB',
    flag: '🇬🇧',
    host: 'uk-lon01.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'AES-256-GCM',
    ping: 142,
    load: 49,
    category: 'Free',
    recommendedFor: 'BBC iPlayer & European peer-to-peer',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - UK London Node
# Placed in: app/src/main/assets/servers/United Kingdom (London).conf
client
dev tun
proto udp
remote uk-lon01.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
dhcp-option DNS 1.1.1.1
redirect-gateway def1

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
-----END CERTIFICATE-----
</ca>`,
  },
  {
    id: 'nl-amsterdam',
    filename: 'Netherlands (Amsterdam).conf',
    country: 'Netherlands',
    city: 'Amsterdam',
    countryCode: 'NL',
    flag: '🇳🇱',
    host: 'nl-ams03.banglavpn33.net',
    port: 1194,
    protocol: 'udp',
    cipher: 'AES-256-GCM',
    ping: 128,
    load: 31,
    category: 'VIP',
    recommendedFor: 'Zero logs, high privacy & uncapped bandwidth',
    authType: 'inline-cert',
    rawConfig: `# BanglaVPN 33 - Netherlands Private Tunnel
# Placed in: app/src/main/assets/servers/Netherlands (Amsterdam).conf
client
dev tun
proto udp
remote nl-ams03.banglavpn33.net 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
dhcp-option DNS 1.1.1.1
redirect-gateway def1

<ca>
-----BEGIN CERTIFICATE-----
MIIDQjCCAiqgAwIBAgIUQYxS8g+4a8b7c9d0e1f2g3h4i5j6MA0GCSqGSIb3DQEB
CwUAMCIxIDAeBgNVBAMMF0JhbmdsYVZQTjMzIFJvb3QgQ0EwHhcNMjQwMTAxMDAw
-----END CERTIFICATE-----
</ca>`,
  }
];

export const README_CONTENT = `========================================================================
BanglaVPN 33 - Server Configuration Directory
Folder Path: app/src/main/assets/servers/
========================================================================

HOW IT WORKS IN THE ANDROID APP:
1. Place all your OpenVPN configuration files (.conf or .ovpn) directly 
   into this folder: BanglaVpn33/app/src/main/assets/servers/

2. When the Android application starts, MainActivity.kt executes:
   val serverFiles = context.assets.list("servers")
   
   It automatically iterates through each file, extracts the filename
   (e.g., "Japan (example).conf"), and adds it to the ServerAdapter
   RecyclerView list.

3. When a user taps a server card:
   - The selected .conf file content is read via assets.open("servers/" + filename)
   - It is parsed and handed to BanglaVpnService.kt
   - The VPN service requests VPN permission via VpnService.prepare(this)
   - The TUN interface is established and encrypted traffic begins routing!

CONFIG SPECIFICATIONS SUPPORTED:
- OpenVPN 2.5 / 2.6 standards
- Cipher: AES-256-GCM, AES-128-GCM, CHACHA20-POLY1305
- Transport: UDP (recommended for speed) or TCP (port 443 for stealth)
- Inline Certificates: <ca>, <cert>, <key>, <tls-auth>
- DNS Directives: dhcp-option DNS 1.1.1.1 or custom local BDIX DNS

TIPS:
- Filename without extension is displayed as the server title in the app.
- Name your files cleanly, e.g. "Singapore - Low Ping.conf" or "USA - Netflix.conf"
`;
