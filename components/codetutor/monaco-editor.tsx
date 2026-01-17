"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { SupportedLanguage } from "@/lib/types/codetutor";
import { Loader2, Mic, MicOff } from "lucide-react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import Peer from "peerjs";
import { getWebSocketUrl, getVoiceWebSocketUrl } from "@/lib/ws-config";

interface MonacoEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: SupportedLanguage;
  errorLine?: number;
  onCursorChange?: (line: number, column: number) => void;
  roomId?: string;
  wsUrl?: string;
}

const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  cpp: "cpp",
  c: "c",
  java: "java",
};

export function MonacoEditor({
  value,
  onChange,
  language,
  errorLine,
  onCursorChange,
  roomId,
  wsUrl,
}: MonacoEditorProps) {
  // Use automatic URL detection if not provided
  const baseWsUrl = wsUrl || getWebSocketUrl();
  const voiceWsUrl = getVoiceWebSocketUrl();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<any | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const signalWsRef = useRef<WebSocket | null>(null);
  const availablePeersRef = useRef<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const isYjsInitializedRef = useRef(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Focus the editor
    editor.focus();

    // In collaborative mode, initialize Yjs immediately
    if (roomId && !isYjsInitializedRef.current) {
      initializeYjs(editor);
    } else if (!roomId && value) {
      // Set initial value only if not in collaborative mode
      editor.setValue(value);
    }

    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e: any) => {
        onCursorChange(e.position.lineNumber, e.position.column);
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !roomId) {
      onChange(value);
    }
  };

  useEffect(() => {
    if (editorRef.current && errorLine) {
      const editor = editorRef.current;
      const model = editor.getModel();

      if (model) {
        const newDecorations = editor.deltaDecorations(decorationsRef.current, [
          {
            range: {
              startLineNumber: errorLine,
              startColumn: 1,
              endLineNumber: errorLine,
              endColumn: model.getLineMaxColumn(errorLine),
            },
            options: {
              isWholeLine: true,
              className: "error-line-highlight",
              glyphMarginClassName: "error-line-glyph",
            },
          },
        ]);
        decorationsRef.current = newDecorations;

        // Scroll to error line
        editor.revealLineInCenter(errorLine);
      }
    } else if (
      editorRef.current &&
      !errorLine &&
      decorationsRef.current.length > 0
    ) {
      editorRef.current.deltaDecorations(decorationsRef.current, []);
      decorationsRef.current = [];
    }
  }, [errorLine]);

  const initializeYjs = (editor: any) => {
    if (isYjsInitializedRef.current) return;

    console.log("Initializing Yjs for room:", roomId);
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // y-websocket adds the roomId to the URL, so we pass the base URL with /yjs
    // Result: ws://localhost:8080/yjs/roomId or wss://domain/yjs/roomId
    const provider = new WebsocketProvider(baseWsUrl, roomId, ydoc, {
      connect: true,
    });
    providerRef.current = provider;

    const ytext = ydoc.getText("monaco");

    // Wait for sync before setting up binding
    provider.once("sync", (isSynced: boolean) => {
      console.log("Yjs synced:", isSynced, "ytext length:", ytext.length);

      // Only set initial value if we're the first client and have content
      if (isSynced && ytext.length === 0 && value && value.trim()) {
        console.log(
          "Setting initial value to Yjs (first 50 chars):",
          value.substring(0, 50)
        );
        ytext.insert(0, value);
      }
      setIsCollaborating(true);
    });

    // Set up binding immediately
    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;
    isYjsInitializedRef.current = true;

    console.log("Yjs initialized successfully");
  };

  // Collaborative editing with Yjs
  useEffect(() => {
    if (roomId && editorRef.current && !isYjsInitializedRef.current) {
      initializeYjs(editorRef.current);

      return () => {
        console.log("Cleaning up Yjs for room:", roomId);
        isYjsInitializedRef.current = false;
        setIsCollaborating(false);
        if (bindingRef.current) {
          bindingRef.current.destroy();
        }
        if (providerRef.current) {
          providerRef.current.destroy();
        }
        if (ydocRef.current) {
          ydocRef.current.destroy();
        }
      };
    }
  }, [roomId]);

  // Voice call setup with PeerJS
  useEffect(() => {
    if (roomId && baseWsUrl) {
      console.log("Initializing PeerJS for room:", roomId);

      // Generate a simple 2-digit ID
      const twoDigitId = Math.floor(10 + Math.random() * 90).toString();
      const peerId = `${roomId}-${twoDigitId}`;

      // Create WebSocket connection FIRST for peer signaling (port 8081)
      console.log("🔗 Creating voice WebSocket:");
      console.log("   wsUrl input:", baseWsUrl);
      console.log("   voiceWsUrl output:", voiceWsUrl);
      console.log("   URL contains 8081?", voiceWsUrl.includes("8081"));

      const signalWs = new WebSocket(voiceWsUrl);
      signalWsRef.current = signalWs;
      console.log("✅ WebSocket created, connecting to:", voiceWsUrl);

      // Set message handler BEFORE onopen to catch all messages
      signalWs.onmessage = (event) => {
        try {
          // Ignore binary messages (Yjs)
          if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
            console.log("⚠️ Ignoring binary message on voice port");
            return;
          }

          console.log(
            "📨 Client received message:",
            event.data.substring(0, 100)
          );
          const data = JSON.parse(event.data);

          if (
            data.type === "peer-announce" &&
            data.peerId &&
            data.peerId !== peerId
          ) {
            console.log("📍 Found peer via announce:", data.peerId);
            availablePeersRef.current.add(data.peerId);
            console.log(
              "   Total peers now:",
              Array.from(availablePeersRef.current)
            );
          } else if (
            data.type === "existing-peers" &&
            Array.isArray(data.peers)
          ) {
            console.log("📍 Received existing peers:", data.peers);
            data.peers.forEach((peer: string) => {
              availablePeersRef.current.add(peer);
            });
            console.log(
              "   Total peers now:",
              Array.from(availablePeersRef.current)
            );
          }
        } catch (err) {
          console.log("⚠️ Error parsing message:", err);
        }
      };

      signalWs.onopen = () => {
        console.log("✅ Voice signaling WebSocket connected to", voiceWsUrl);
        console.log("📤 Sending join-room message to server");
        try {
          const joinMsg = JSON.stringify({ type: "join-room", roomId });
          console.log("📤 Sending:", joinMsg);
          signalWs.send(joinMsg);
          console.log("✅ join-room sent");
        } catch (err) {
          console.error("❌ Error sending join-room:", err);
        }
      };

      signalWs.onerror = (error) => {
        console.error("❌ Voice signaling WebSocket error:", error);
      };

      signalWs.onclose = () => {
        console.log("🔌 Voice signaling WebSocket closed");
      };

      // Create PeerJS instance AFTER WebSocket is connected
      const peer = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });
      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("✅ Your Voice ID:", twoDigitId, "| Actual PeerJS ID:", id);
        setMyPeerId(id);

        // NOW announce to others after PeerJS is open
        if (signalWs.readyState === WebSocket.OPEN) {
          console.log("� Sending peer-announce message to server");
          try {
            const announceMsg = JSON.stringify({
              type: "peer-announce",
              roomId,
              peerId,
            });
            console.log("📤 Sending:", announceMsg);
            signalWs.send(announceMsg);
            console.log("✅ peer-announce sent");
          } catch (err) {
            console.error("❌ Error sending peer-announce:", err);
          }
        } else {
          console.log(
            "⏳ WebSocket readyState:",
            signalWs.readyState,
            "(not OPEN)"
          );
        }
      });

      peer.on("error", (err) => {
        console.error("❌ PeerJS error:", err);
      });

      // Handle incoming calls
      peer.on("call", async (call) => {
        console.log("Receiving incoming call");
        try {
          // Get user's microphone
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          localStreamRef.current = stream;

          // Answer the call with our stream
          call.answer(stream);
          callRef.current = call;

          // Listen for remote stream
          call.on("stream", (remoteStream) => {
            console.log("Received remote stream!");
            if (!remoteAudioRef.current) {
              remoteAudioRef.current = new Audio();
              remoteAudioRef.current.volume = 1.0;
            }
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch((err) => {
              console.error("Audio play error:", err);
              // Try playing on user interaction
              document.addEventListener(
                "click",
                () => {
                  remoteAudioRef.current?.play();
                },
                { once: true }
              );
            });
            setIsVoiceConnected(true);
          });

          call.on("close", () => {
            console.log("Call closed");
            setIsVoiceConnected(false);
          });
        } catch (error) {
          console.error("Error answering call:", error);
          alert(
            "Failed to access microphone. Please check your browser permissions."
          );
        }
      });

      return () => {
        console.log("Cleaning up PeerJS connection");
        if (callRef.current) {
          callRef.current.close();
        }
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.pause();
          remoteAudioRef.current.srcObject = null;
          remoteAudioRef.current = null;
        }
        if (
          signalWsRef.current &&
          signalWsRef.current.readyState === WebSocket.OPEN
        ) {
          signalWsRef.current.close();
        }
        if (peer && !peer.destroyed) {
          peer.destroy();
        }
        availablePeersRef.current.clear();
        setIsVoiceConnected(false);
        setIsMuted(false);
      };
    }
  }, [roomId, baseWsUrl]);

  const toggleMute = () => {
    if (!localStreamRef.current) {
      console.log("No local stream to mute");
      return;
    }

    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      console.log("Microphone", audioTrack.enabled ? "unmuted" : "muted");
    }
  };

  const startVoiceCall = async () => {
    if (!peerRef.current || isVoiceConnected || callRef.current) {
      console.log("❌ Voice call already active or peer not ready");
      console.log(
        "   peerRef:",
        !!peerRef.current,
        "connected:",
        isVoiceConnected,
        "callRef:",
        !!callRef.current
      );
      return;
    }

    try {
      console.log("🎤 Starting voice call...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsMuted(false);

      // Get available peers from the ref
      const otherPeerIds = Array.from(availablePeersRef.current);
      console.log("📍 Available peers in room:", otherPeerIds);

      if (otherPeerIds.length === 0) {
        console.log(
          "❌ No peers found. Available peers ref:",
          Array.from(availablePeersRef.current)
        );
        alert(
          "No other user found in this room. Make sure the other user has opened the page and wait a moment for peer discovery."
        );
        return;
      }

      console.log("✅ Found other peers:", otherPeerIds);

      // Call the first available peer
      const otherPeerId = otherPeerIds[0];
      console.log("📞 Calling peer:", otherPeerId);

      const call = peerRef.current.call(otherPeerId, stream);
      callRef.current = call;

      call.on("stream", (remoteStream) => {
        console.log("✅ Voice connected!");
        if (!remoteAudioRef.current) {
          remoteAudioRef.current = new Audio();
          remoteAudioRef.current.volume = 1.0;
        }
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch((err) => {
          console.error("Audio play error:", err);
          // Try playing on user interaction
          document.addEventListener(
            "click",
            () => {
              remoteAudioRef.current?.play();
            },
            { once: true }
          );
        });
        setIsVoiceConnected(true);
      });

      call.on("close", () => {
        console.log("Call closed");
        setIsVoiceConnected(false);
      });

      call.on("error", (err) => {
        console.error("Call error:", err);
        setIsVoiceConnected(false);
        alert(
          "Voice connection failed. Make sure both browsers are open and try again."
        );
      });

      console.log("Call initiated successfully");
    } catch (error) {
      console.error("Error starting voice call:", error);
      alert(
        "Failed to access microphone. Please check your browser permissions."
      );
    }
  };

  return (
    <>
      <style jsx global>{`
        .error-line-highlight {
          background: rgba(255, 0, 0, 0.1);
          border-left: 3px solid #ff0000;
        }
        .error-line-glyph {
          background: #ff0000;
          width: 3px !important;
          margin-left: 3px;
        }
      `}</style>
      <div className="relative w-full h-full">
        {roomId && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {isCollaborating && (
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Collaboration
              </div>
            )}
            <button
              onClick={startVoiceCall}
              disabled={isVoiceConnected}
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {isVoiceConnected ? "Voice Connected" : "Start Voice"}
            </button>
            {isVoiceConnected && (
              <button
                onClick={toggleMute}
                className={`px-3 py-1.5 rounded transition-all text-sm flex items-center gap-2 ${
                  isMuted
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isMuted ? "Unmute" : "Mute"}
              </button>
            )}
          </div>
        )}
        <Editor
          key={roomId || "local"}
          height="100%"
          language={MONACO_LANGUAGE_MAP[language] || "javascript"}
          value={roomId ? undefined : value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: true,
            renderLineHighlight: "all",
            matchBrackets: "always",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: true,
            tabCompletion: "on",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            formatOnPaste: true,
            formatOnType: true,
            contextmenu: true,
            links: true,
            mouseWheelZoom: false,
            multiCursorModifier: "ctrlCmd",
            snippetSuggestions: "inline",
            domReadOnly: false,
            readOnlyMessage: { value: "" },
          }}
          loading={
            <div className="flex h-full items-center justify-center bg-background border border-pop rounded">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-pop" />
                <p className="text-sm text-foreground/60">
                  Loading Monaco Editor...
                </p>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
