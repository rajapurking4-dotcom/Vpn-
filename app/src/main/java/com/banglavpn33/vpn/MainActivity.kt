package com.banglavpn33.vpn

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager

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
            val context = this
            val serverFiles = context.assets.list("servers") ?: emptyArray()
            val serverList = serverFiles.filter { it.endsWith(".conf") || it.endsWith(".ovpn") }

            if (serverList.isEmpty()) {
                Toast.makeText(this, "No server configs found in assets/servers", Toast.LENGTH_LONG).show()
                return
            }

            // Setup RecyclerView with ServerAdapter
            val adapter = ServerAdapter(serverList) { selectedFile ->
                selectedServerFile = selectedFile
                val config = context.assets.open("servers/" + selectedFile).bufferedReader().use { it.readText() }
                Toast.makeText(this, "Selected: $selectedFile (${config.length} bytes)", Toast.LENGTH_SHORT).show()
            }
            // recyclerView.adapter = adapter
            // recyclerView.layoutManager = LinearLayoutManager(this)

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun toggleVpnConnection() {
        if (!isConnected) {
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
        val filename = selectedServerFile ?: return
        val context = this
        val config = context.assets.open("servers/" + filename).bufferedReader().use { it.readText() }

        val intent = Intent(this, BanglaVpnService::class.java).apply {
            action = BanglaVpnService.ACTION_CONNECT
            putExtra(BanglaVpnService.EXTRA_CONFIG, config)
            putExtra(BanglaVpnService.EXTRA_SERVER_NAME, filename)
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
}
