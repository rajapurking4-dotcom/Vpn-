package com.banglavpn33.vpn

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer

class BanglaVpnService : VpnService(), Runnable {

    companion object {
        const val ACTION_CONNECT = "com.banglavpn33.vpn.CONNECT"
        const val ACTION_DISCONNECT = "com.banglavpn33.vpn.DISCONNECT"
        const val EXTRA_CONFIG = "extra_config_content"
        const val EXTRA_SERVER_NAME = "extra_server_name"
        private const val TAG = "BanglaVpnService"
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var vpnThread: Thread? = null
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == ACTION_CONNECT) {
            val configContent = intent.getStringExtra(EXTRA_CONFIG) ?: ""
            val serverName = intent.getStringExtra(EXTRA_SERVER_NAME) ?: "Default Server"
            startVpnTunnel(configContent, serverName)
        } else if (action == ACTION_DISCONNECT) {
            stopVpnTunnel()
        }
        return START_NOT_STICKY
    }

    private fun startVpnTunnel(config: String, serverName: String) {
        stopVpnTunnel()
        isRunning = true
        vpnThread = Thread(this, "BanglaVpnThread").apply { start() }
    }

    override fun run() {
        try {
            // Build the VPN interface
            val builder = Builder()
                .setSession("BanglaVPN 33")
                .addAddress("10.8.0.2", 24)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")
                .addRoute("0.0.0.0", 0)
                .setMtu(1500)
                .setBlocking(true)

            vpnInterface = builder.establish()
            Log.i(TAG, "VPN TUN interface established successfully")

            val vpnInput = FileInputStream(vpnInterface?.fileDescriptor)
            val vpnOutput = FileOutputStream(vpnInterface?.fileDescriptor)
            val packet = ByteBuffer.allocate(32767)

            while (isRunning) {
                val length = vpnInput.read(packet.array())
                if (length > 0) {
                    packet.clear()
                }
                Thread.sleep(10)
            }
        } catch (e: Exception) {
            Log.e(TAG, "VPN tunnel error: ${e.message}", e)
        } finally {
            cleanup()
        }
    }

    private fun stopVpnTunnel() {
        isRunning = false
        vpnThread?.interrupt()
        vpnThread = null
        cleanup()
    }

    private fun cleanup() {
        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN interface: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpnTunnel()
    }
}
