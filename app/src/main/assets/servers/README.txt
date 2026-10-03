========================================================================
BanglaVPN 33 - Server Configuration Directory
Folder Path: app/src/main/assets/servers/
========================================================================

HOW IT WORKS IN THE ANDROID APP:
1. Place all your OpenVPN / WireGuard configuration files (.conf or .ovpn) directly
   into this folder: BanglaVpn33/app/src/main/assets/servers/
2. When the Android application starts, MainActivity.kt executes:
   val serverFiles = context.assets.list("servers")
   It automatically iterates through each file, extracts the filename
   (e.g., "Japan (example).conf", "Singapore (SG Fast).conf", "Bangladesh (Dhaka BDIX).conf"),
   and adds it to the ServerAdapter RecyclerView list.
3. When a user taps a server card:
   - The selected .conf file content is read via assets.open("servers/" + filename)
   - It is parsed and handed to BanglaVpnService.kt
   - The VPN service requests VPN permission via VpnService.prepare(this)
   - The TUN interface is established and encrypted traffic begins routing!

SECURITY & KEY PAIRS (umask 077):
- All server and client private keys must be generated with 'umask 077'
  to ensure strict 0600 permissions (-rw-------).
- Never share private keys or bundle them in unencrypted formats.

CONFIG SPECIFICATIONS SUPPORTED:
- OpenVPN 2.5 / 2.6 standards & WireGuard profiles
- Cipher: AES-256-GCM, AES-128-GCM, CHACHA20-POLY1305
- Transport: UDP (recommended for speed) or TCP (port 443 for stealth)
- Inline Certificates: <ca>, <cert>, <key>, <tls-auth>
- DNS Directives: dhcp-option DNS 1.1.1.1 or custom local BDIX DNS

TIPS:
- Filename without extension is displayed as the server title in the app.
- Name your files cleanly, e.g. "Singapore (SG Fast).conf" or "Bangladesh (Dhaka BDIX).conf".
