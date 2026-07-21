import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, FolderKanban, Users } from "lucide-react";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { getUser } from "../utils/auth";

export default function Chat() {
  const currentUser = getUser();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        const res = await API.get("/workspaces");
        setWorkspaces(res.data);
        if (res.data.length > 0) {
          setActiveWorkspace(res.data[0]);
        }
      } catch (error) {
        console.error("Error loading workspaces for chat", error);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await API.get(`/messages/${activeWorkspace._id}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages", error);
      } finally {
        setLoadingMessages(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    const socket = getSocket();
    socket.emit("join_workspace", activeWorkspace._id);

    const handleNewMessage = (msg) => {
      if (msg.workspace === activeWorkspace._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_workspace", activeWorkspace._id);
      socket.off("new_message", handleNewMessage);
    };
  }, [activeWorkspace?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeWorkspace) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      const res = await API.post(`/messages/${activeWorkspace._id}`, {
        text: textToSend,
      });

      setMessages((prev) => {
        if (prev.some((m) => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      scrollToBottom();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
      {/* Workspace Sidebar */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            Workspace Channels
          </h3>
          <p className="text-xs text-slate-400 mt-1">Select a workspace to enter team chat</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loadingWorkspaces ? (
            <div className="p-4 text-center text-xs text-slate-500">Loading channels...</div>
          ) : workspaces.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No workspaces found</div>
          ) : (
            workspaces.map((ws) => {
              const isActive = activeWorkspace?._id === ws._id;
              return (
                <button
                  key={ws._id}
                  onClick={() => setActiveWorkspace(ws)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition ${
                    isActive
                      ? "bg-blue-600/10 border border-blue-500/30 text-white"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <FolderKanban size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm leading-tight">{ws.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users size={10} />
                        {ws.memberCount ?? ws.members?.length ?? 1} members
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/60 overflow-hidden">
        {activeWorkspace ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-white text-base"># {activeWorkspace.name}</h3>
                <p className="text-xs text-slate-400">{activeWorkspace.description || "Workspace general chat"}</p>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading chat history...</div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Welcome to #{activeWorkspace.name}</p>
                  <p className="text-xs text-slate-400 mt-1">This is the start of the workspace conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?._id === currentUser?.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow ${isMe ? "bg-blue-600" : "bg-slate-700"}`}>
                        {msg.sender?.name
                          ? msg.sender.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : "?"}
                      </div>

                      <div>
                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "justify-end" : ""}`}>
                          <span className="text-xs font-medium text-slate-300">
                            {isMe ? "You" : msg.sender?.name || "Unknown"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3 shrink-0">
              <input
                type="text"
                placeholder={`Message #${activeWorkspace.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:opacity-40 shadow-md shadow-blue-600/20"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select a workspace to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
