package com.banglavpn33.vpn

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
        holder.textServerName.text = serverFilename.removeSuffix(".conf").removeSuffix(".ovpn")
        holder.textStatus.text = "Ready"

        holder.itemView.setOnClickListener {
            onServerClick(serverFilename)
        }
    }

    override fun getItemCount(): Int = servers.size
}
