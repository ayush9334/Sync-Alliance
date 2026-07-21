import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Crown, Shield, UserPlus, X, MessageSquare, Send, ArrowLeft } from "lucide-react";
import API from "../services/api";
import TaskManager from "../components/TaskManager";
import { getSocket } from "../services/socket";
import { getUser } from "../utils/auth";

export default function Workspace() {
  const { id } = useParams();
  const currentUser = getUser();

  const [workspace, setWorkspace] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Workspace Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchWorkspace = async () => {
    try {
      const res = await API.get(`/workspaces/${id}`);
      setWorkspace(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    fetchMessages();

    const socket = getSocket();
    socket.emit("join_workspace", id);

    const handleNewMessage = (msg) => {
      if (msg.workspace === id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_workspace", id);
      socket.off("new_message", handleNewMessage);
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const inviteMember = async () => {
    if (!email.trim()) {
      alert("Please enter an email.");
      return;
    }

    try {
      setInviteLoading(true);
      const res = await API.post(`/workspaces/${id}/invite`, { email: email.trim() });
      alert(res.data.message);
      setWorkspace(res.data.workspace);
      setEmail("");
      setShowInvite(false);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput("");

    try {
      const res = await API.post(`/messages/${id}`, { text: textToSend });
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      scrollToBottom();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send message");
    }
  };

  if (!workspace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{workspace.name}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {workspace.description || "Workspace for team collaboration"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-300">
              👥 {workspace.members?.length || 0} Members
            </div>

            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
            >
              <UserPlus size={18} />
              Invite Member
            </button>
          </div>
        </div>
      </div>

      {/* Members & Tasks Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Team Members List */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 flex flex-col h-[600px]">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white shrink-0">
            <Users className="text-blue-500" size={22} />
            Team Members
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {workspace.members && workspace.members.length > 0 ? (
              workspace.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-800/40 p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 font-bold text-white text-xs">
                      {member.user?.name
                        ? member.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {member.user?.name || "Unknown User"}
                      </h3>
                      <p className="text-[11px] text-slate-400">{member.user?.email}</p>
                    </div>
                  </div>

                  <div>
                    {member.role === "Owner" ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
                        <Crown size={13} /> Owner
                      </span>
                    ) : member.role === "Admin" ? (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-400">
                        <Shield size={13} /> Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No members found.</p>
            )}
          </div>
        </div>

        {/* Task Manager Component */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <TaskManager workspaceId={id} members={workspace.members} />
        </div>
      </div>

      {/* Embedded Workspace Real-Time Chat */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <MessageSquare className="text-blue-500" size={22} />
          Workspace Team Chat
        </h2>

        <div className="flex h-96 flex-col rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No chat messages yet. Send a message to start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?.id;
                return (
                  <div key={msg._id} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${isMe ? "bg-blue-600" : "bg-slate-700"}`}>
                      {msg.sender?.name ? msg.sender.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                    </div>

                    <div>
                      <div className={`flex items-baseline gap-2 mb-0.5 ${isMe ? "justify-end" : ""}`}>
                        <span className="text-[11px] font-semibold text-slate-300">{isMe ? "You" : msg.sender?.name}</span>
                        <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed ${isMe ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700/60"}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message #${workspace.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-40 transition"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 border border-slate-700 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Invite Member</h2>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <input
              type="email"
              placeholder="Enter member email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-blue-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowInvite(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={inviteMember}
                disabled={inviteLoading}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {inviteLoading ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}