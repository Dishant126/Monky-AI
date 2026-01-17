const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("M.O.N.K.Y WebSocket Server Running\n");
});

// Create WebSocket servers for different paths
const wssYjs = new WebSocketServer({ noServer: true });
const wssVoice = new WebSocketServer({ noServer: true });

// Room management for voice signaling
const rooms = new Map(); // roomId -> { peers: Set, clients: Set }

// Yjs WebSocket Handler (binary messages only)
wssYjs.on("connection", (ws, request) => {
  console.log("✅ [Yjs] Client connected");

  ws.on("message", (message) => {
    // Relay binary Yjs messages to all other clients
    wssYjs.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("🔌 [Yjs] Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("❌ [Yjs] WebSocket error:", error.message);
  });
});

// Voice WebSocket Handler (JSON messages)
wssVoice.on("connection", (ws, request) => {
  console.log("✅ [Voice] Client connected");
  let currentRoom = null;
  let myPeerId = null;

  ws.on("message", (message) => {
    let dataStr;
    try {
      // Handle Node.js Buffer objects
      dataStr = typeof message === "string" ? message : message.toString("utf8");
      
      // Ignore binary messages (they belong to Yjs)
      if (dataStr.startsWith("\x00") || dataStr.startsWith("\x01")) {
        return;
      }

      const data = JSON.parse(dataStr);

      // Handle join-room
      if (data.type === "join-room" && data.roomId) {
        currentRoom = data.roomId;
        
        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, { peers: new Set(), clients: new Set() });
        }
        
        rooms.get(currentRoom).clients.add(ws);
        console.log(`📍 [Voice] Client joined room: ${currentRoom}`);
        console.log(`   Total clients in room: ${rooms.get(currentRoom).clients.size}`);
      }

      // Handle peer-announce
      if (data.type === "peer-announce" && data.roomId && data.peerId) {
        const roomId = data.roomId;
        myPeerId = data.peerId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, { peers: new Set(), clients: new Set() });
        }

        const room = rooms.get(roomId);
        
        // Send existing peers to new peer
        const existingPeers = Array.from(room.peers).filter(p => p !== myPeerId);
        if (existingPeers.length > 0) {
          ws.send(JSON.stringify({
            type: "existing-peers",
            peers: existingPeers
          }));
          console.log(`📤 [Voice] Sent ${existingPeers.length} existing peers to ${myPeerId}`);
        }

        // Add new peer and broadcast to room
        room.peers.add(myPeerId);
        console.log(`🎤 [Voice] Peer announced: ${myPeerId} in room ${roomId}`);
        console.log(`   Total peers: ${room.peers.size}`);

        // Broadcast new peer to all others in room
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({
              type: "peer-announce",
              peerId: myPeerId,
              roomId: roomId
            }));
          }
        });
      }

      // Relay other signaling messages (offer, answer, ice-candidate)
      if (["offer", "answer", "ice-candidate"].includes(data.type) && currentRoom) {
        const room = rooms.get(currentRoom);
        if (room) {
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(dataStr);
            }
          });
        }
      }

    } catch (err) {
      // Silently ignore parse errors from binary data
      if (err instanceof SyntaxError) {
        return;
      }
      console.error("❌ [Voice] Error processing message:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("🔌 [Voice] Client disconnected");
    
    // Clean up room membership
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      room.clients.delete(ws);
      
      if (myPeerId) {
        room.peers.delete(myPeerId);
        console.log(`🗑️  [Voice] Removed peer: ${myPeerId} from room ${currentRoom}`);
      }

      // Remove empty rooms
      if (room.clients.size === 0) {
        rooms.delete(currentRoom);
        console.log(`🗑️  [Voice] Removed empty room: ${currentRoom}`);
      } else {
        console.log(`   Remaining clients in room: ${room.clients.size}`);
      }
    }
  });

  ws.on("error", (error) => {
    console.error("❌ [Voice] WebSocket error:", error.message);
  });
});

// Handle WebSocket upgrades based on path
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;

  // Match /yjs or /yjs/roomId
  if (pathname === "/yjs" || pathname.startsWith("/yjs/")) {
    wssYjs.handleUpgrade(request, socket, head, (ws) => {
      wssYjs.emit("connection", ws, request);
    });
  } 
  // Match /voice or /voice/roomId
  else if (pathname === "/voice" || pathname.startsWith("/voice/")) {
    wssVoice.handleUpgrade(request, socket, head, (ws) => {
      wssVoice.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
    console.log(`❌ Unknown WebSocket path: ${pathname}`);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 M.O.N.K.Y WebSocket Server running on port ${PORT}`);
  console.log(`📡 Yjs endpoint: ws://localhost:${PORT}/yjs`);
  console.log(`🎤 Voice endpoint: ws://localhost:${PORT}/voice`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
