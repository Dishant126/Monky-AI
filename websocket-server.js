// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 8080 }); // For Yjs code sync
// const voiceWss = new WebSocket.Server({ port: 8081 }); // For voice signaling

// const rooms = new Map(); // roomId -> { peers: Set<peerId>, clients: Set<WebSocket> }

// // ========== YJS WEBSOCKET SERVER (Port 8080) ==========
// wss.on('connection', (ws) => {
//   console.log('🟦 Yjs client connected to port 8080');

//   ws.on('message', (message) => {
//     try {
//       // Yjs protocol - only binary messages
//       if (typeof message !== 'string') {
//         console.log(`Relaying Yjs binary message (${message.length} bytes)`);
//         wss.clients.forEach(client => {
//           if (client !== ws && client.readyState === WebSocket.OPEN) {
//             client.send(message);
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Yjs error:', error);
//     }
//   });

//   ws.on('close', () => {
//     console.log('🟦 Yjs client disconnected');
//   });

//   ws.on('error', (error) => {
//     console.error('Yjs WebSocket error:', error);
//   });
// });

// console.log('🟦 Yjs WebSocket server listening on port 8080');

// // ========== VOICE SIGNALING WEBSOCKET SERVER (Port 8081) ==========
// voiceWss.on('connection', (ws) => {
//   console.log('🎙️ Voice client connected to port 8081');
//   console.log('   WebSocket readyState:', ws.readyState, 'CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');

//   let currentRoom = null;
//   let currentPeerId = null;

//   ws.on('message', (message) => {
//     try {
//       // Convert Buffer to string if needed (ws library sends Buffers, not strings)
//       let dataStr = typeof message === 'string' ? message : message.toString('utf8');
      
//       // Try to parse as JSON
//       let data;
//       try {
//         data = JSON.parse(dataStr);
//       } catch (parseErr) {
//         console.log('⚠️ Failed to parse JSON:', dataStr.substring(0, 50), parseErr.message);
//         return;
//       }
      
//       console.log(`📥 PARSED: type=${data.type}, room=${data.roomId}`);
      
//       if (data.type === 'join-room') {
//           currentRoom = data.roomId;
//           if (!rooms.has(currentRoom)) {
//             rooms.set(currentRoom, { peers: new Set(), clients: new Set() });
//             console.log(`✅ Created new room: ${currentRoom}`);
//           }
//           rooms.get(currentRoom).clients.add(ws);
//           const clientCount = rooms.get(currentRoom).clients.size;
//           const peerCount = rooms.get(currentRoom).peers.size;
//           console.log(`👥 ${currentRoom}: ${clientCount} clients, ${peerCount} peers`);
          
//         } else if (data.type === 'peer-announce' && data.roomId && data.peerId) {
//           // Track this peer
//           currentRoom = data.roomId;
//           currentPeerId = data.peerId;
//           console.log(`📢 Peer announcing: ${data.peerId} in room ${data.roomId}`);
          
//           if (!rooms.has(currentRoom)) {
//             rooms.set(currentRoom, { peers: new Set(), clients: new Set() });
//             console.log(`✅ Created new room: ${currentRoom}`);
//           }
          
//           const room = rooms.get(currentRoom);
//           room.peers.add(data.peerId);
//           room.clients.add(ws);
          
//           const peerList = Array.from(room.peers);
//           console.log(`🔍 Room ${currentRoom} peers: [${peerList.join(', ')}]`);
          
//           // Send ALL existing peers to this new peer
//           const otherPeers = peerList.filter(p => p !== data.peerId);
//           console.log(`📤 Sending ${otherPeers.length} existing peers to ${data.peerId}: [${otherPeers.join(', ')}]`);
//           ws.send(JSON.stringify({
//             type: 'existing-peers',
//             peers: otherPeers
//           }));
          
//           // Broadcast this peer to all other clients
//           let broadcastCount = 0;
//           room.clients.forEach(client => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify({
//                 type: 'peer-announce',
//                 peerId: data.peerId,
//                 roomId: data.roomId
//               }));
//               broadcastCount++;
//             }
//           });
//           console.log(`📡 Broadcasted peer ${data.peerId} to ${broadcastCount} other clients`);
          
//         } else if (data.type === 'signal' && currentRoom) {
//           // Relay signaling data to other clients in the room
//           console.log(`Relaying signal in room ${currentRoom}, initiator: ${data.initiator}`);
//           if (rooms.has(currentRoom)) {
//             rooms.get(currentRoom).clients.forEach(client => {
//               if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify({
//                   type: 'signal',
//                   signal: data.signal,
//                   initiator: data.initiator || false
//                 }));
//               }
//             });
//           }
//         }
      
//     } catch (error) {
//       console.error('Voice signaling error:', error);
//     }
//   });

//   ws.on('close', () => {
//     console.log('🎙️ Voice client disconnected');
//     if (currentRoom && rooms.has(currentRoom)) {
//       const room = rooms.get(currentRoom);
//       room.clients.delete(ws);
//       if (currentPeerId) {
//         room.peers.delete(currentPeerId);
//         console.log(`Peer ${currentPeerId} removed from room ${currentRoom}`);
//       }
//       console.log(`Client left room: ${currentRoom} (${room.clients.size} clients, ${room.peers.size} peers remaining)`);
//       if (room.clients.size === 0) {
//         rooms.delete(currentRoom);
//         console.log(`Room ${currentRoom} deleted (empty)`);
//       }
//     }
//   });

//   ws.on('error', (error) => {
//     console.error('Voice WebSocket error:', error);
//   });
// });

// console.log('🎙️ Voice signaling WebSocket server listening on port 8081');


// console.log('WebSocket server running on ws://localhost:8080');
// console.log('Ready for collaborative editing and voice calls');
