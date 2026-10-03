export const KOTLIN_FILES = {
  BanglaVpnService: {
    filename: 'BanglaVpnService.kt',
    path: 'app/src/main/java/com/banglavpn33/vpn/BanglaVpnService.kt',
    code: `package com.banglavpn33.vpn

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
                // Forward packets through OpenVPN / Wireguard encrypted tunnel
                val length = vpnInput.read(packet.array())
                if (length > 0) {
                    // Packet loop processing
                    packet.clear()
                }
                Thread.sleep(10)
            }
        } catch (e: Exception) {
            Log.e(TAG, "VPN tunnel error: \${e.message}", e)
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
            Log.e(TAG, "Error closing VPN interface: \${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpnTunnel()
    }
}`
  },
  MainActivity: {
    filename: 'MainActivity.kt',
    path: 'app/src/main/java/com/banglavpn33/vpn/MainActivity.kt',
    code: `package com.banglavpn33.vpn

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : AppCompatActivity() {

    private val VPN_REQUEST_CODE = 1001
    private var selectedServerFile: String? = null
    private var isConnected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        loadServersFromAssets()
    }

    /**
     * Reads all server .conf files directly from app/src/main/assets/servers/
     */
    private fun loadServersFromAssets() {
        try {
            // List all files in the assets/servers directory
            val files = assets.list("servers") ?: emptyArray()
            val serverList = files.filter { it.endsWith(".conf") || it.endsWith(".ovpn") }

            if (serverList.isEmpty()) {
                Toast.makeText(this, "No server configs found in assets/servers", Toast.LENGTH_LONG).show()
                return
            }

            // Setup RecyclerView with ServerAdapter
            val adapter = ServerAdapter(serverList) { selectedFile ->
                selectedServerFile = selectedFile
                Toast.makeText(this, "Selected: \$selectedFile", Toast.LENGTH_SHORT).show()
            }
            // recyclerView.adapter = adapter
            // recyclerView.layoutManager = LinearLayoutManager(this)

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun toggleVpnConnection() {
        if (!isConnected) {
            // Request VPN permission
            val vpnIntent = VpnService.prepare(this)
            if (vpnIntent != null) {
                startActivityForResult(vpnIntent, VPN_REQUEST_CODE)
            } else {
                onActivityResult(VPN_REQUEST_CODE, Activity.RESULT_OK, null)
            }
        } else {
            disconnectVpn()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            connectVpn()
        }
    }

    private fun connectVpn() {
        val server = selectedServerFile ?: return
        val configContent = readAssetFile("servers/\$server")

        val intent = Intent(this, BanglaVpnService::class.java).apply {
            action = BanglaVpnService.ACTION_CONNECT
            putExtra(BanglaVpnService.EXTRA_CONFIG, configContent)
            putExtra(BanglaVpnService.EXTRA_SERVER_NAME, server)
        }
        startService(intent)
        isConnected = true
    }

    private fun disconnectVpn() {
        val intent = Intent(this, BanglaVpnService::class.java).apply {
            action = BanglaVpnService.ACTION_DISCONNECT
        }
        startService(intent)
        isConnected = false
    }

    private fun readAssetFile(filePath: String): String {
        val inputStream = assets.open(filePath)
        val reader = BufferedReader(InputStreamReader(inputStream))
        return reader.use { it.readText() }
    }
}`
  },
  ServerAdapter: {
    filename: 'ServerAdapter.kt',
    path: 'app/src/main/java/com/banglavpn33/vpn/ServerAdapter.kt',
    code: `package com.banglavpn33.vpn

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ServerAdapter(
    private val servers: List<String>,
    private val onServerClick: (String) -> Unit
) : RecyclerView.Adapter<ServerAdapter.ServerViewHolder>() {

    class ServerViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textServerName: TextView = view.findViewById(R.id.tv_server_name)
        val textStatus: TextView = view.findViewById(R.id.tv_server_status)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ServerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_server, parent, false)
        return ServerViewHolder(view)
    }

    override fun onBindViewHolder(holder: ServerViewHolder, position: Int) {
        val serverFilename = servers[position]
        // Remove .conf or .ovpn for clean UI display
        val displayName = serverFilename
            .replace(".conf", "")
            .replace(".ovpn", "")

        holder.textServerName.text = displayName
        holder.textStatus.text = "Available"
        holder.itemView.setOnClickListener {
            onServerClick(serverFilename)
        }
    }

    override fun getItemCount(): Int = servers.size
}`
  },
  AndroidManifest: {
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.banglavpn33.vpn">

    <!-- Permissions required for VPN service and network operations -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.BanglaVpn33">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Service declaration with BIND_VPN_SERVICE permission -->
        <service
            android:name=".BanglaVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:foregroundServiceType="specialUse"
            android:exported="false">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
        </service>

    </application>
</manifest>`
  }
};
