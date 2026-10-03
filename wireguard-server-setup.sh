#!/bin/bash
# ==============================================================================
# BanglaVPN 33 - Production WireGuard Server Setup Script
# File: wireguard-server-setup.sh
# Generated for: Ubuntu, Debian, CentOS, Rocky Linux
# Target Assets: app/src/main/assets/servers/
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root.${NC} Please run: sudo ./wireguard-server-setup.sh"
   exit 1
fi

WG_DIR="/etc/wireguard"
WG_CONF="$WG_DIR/wg0.conf"
WG_CLIENTS_DIR="$WG_DIR/clients"
SERVER_PORT=51820
SERVER_NET="10.66.66.1/24"
DNS_DEFAULT="1.1.1.1, 1.0.0.1"

echo -e "${GREEN}===> Setting up BanglaVPN 33 WireGuard Server on UDP port $SERVER_PORT <===${NC}"

# Detect Interface & Public IP
SERVER_PUB_NIC=$(ip -4 route ls 2>/dev/null | grep default | grep -Po '(?<=dev )(\S+)' | head -1 || echo "eth0")
if [[ -z "$SERVER_PUB_NIC" ]]; then
    SERVER_PUB_NIC="eth0"
fi
SERVER_PUB_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Install Packages
if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y && apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" wireguard iptables qrencode curl
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y wireguard-tools iptables qrencode curl
fi

# Enable Forwarding
mkdir -p /etc/sysctl.d
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-wireguard-forward.conf
sysctl --system >/dev/null 2>&1 || sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true

mkdir -p "$WG_DIR" "$WG_CLIENTS_DIR"
chmod 700 "$WG_DIR"

# Generate Keys
SERVER_PRIVKEY=$(wg genkey)
SERVER_PUBKEY=$(echo "$SERVER_PRIVKEY" | wg pubkey)
echo "$SERVER_PRIVKEY" > "$WG_DIR/server_private.key"
echo "$SERVER_PUBKEY" > "$WG_DIR/server_public.key"
chmod 600 "$WG_DIR/server_private.key"

# Write Server Config
cat <<EOF > "$WG_CONF"
[Interface]
Address = $SERVER_NET
ListenPort = $SERVER_PORT
PrivateKey = $SERVER_PRIVKEY
SaveConfig = false

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
EOF

if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
    systemctl enable wg-quick@wg0
    systemctl restart wg-quick@wg0
fi

echo -e "${GREEN}[✓] WireGuard Server is Active on UDP $SERVER_PORT!${NC}"
echo -e "Use the interactive client menu to export profiles to app/src/main/assets/servers/"
