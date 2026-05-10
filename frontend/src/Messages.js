import { useEffect, useState, useRef } from "react";
import api from "./services/api";
import Sidebar from "./Sidebar";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv.id);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = () => {
    api.get("/conversations")
      .then((res) => setConversations(res.data.conversations || []))
      .catch(() => {
        // Fallback: build conversations from supervision relationships
        api.get("/auth/profile").then((profileRes) => {
          const user = profileRes.data.user;
          if (user.role === "ETUDIANT" && user.encadrant) {
            setConversations([{
              id: user.encadrant.id,
              other_user: user.encadrant,
              last_message: "Start your conversation",
              unread: 0,
            }]);
          }
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  const fetchMessages = (convId) => {
    api.get(`/conversations/${convId}/messages`)
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => setMessages([]));
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    setSending(true);
    const tempMsg = {
      id: Date.now(),
      content: newMessage,
      sender_id: currentUser.id,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    try {
      const res = await api.post(`/conversations/${selectedConv.id}/messages`, { content: tempMsg.content });
      setMessages((prev) => prev.map((m) => m.id === tempMsg.id ? { ...res.data.message, pending: false } : m));
    } catch {
      // keep the message displayed (optimistic UI)
      setMessages((prev) => prev.map((m) => m.id === tempMsg.id ? { ...m, pending: false } : m));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="messages" />
      <div className="pro-main-wrapper">
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Messages</h1>
            <p className="pro-page-sub">Communicate with your supervisor</p>
          </div>
          <div className="pro-topbar-right">
            <button className="pro-topbar-btn"><i className="bi bi-bell"></i></button>
            <button className="pro-topbar-btn"><i className="bi bi-gear"></i></button>
            <div className="pro-topbar-avatar">{currentUser.nom?.charAt(0) || "U"}</div>
          </div>
        </header>

        <main className="pro-content" style={{ padding: 0 }}>
          <div className="msg-layout">
            {/* Conversations Panel */}
            <div className="msg-sidebar">
              <div className="msg-sidebar-header">
                <h3>Conversations</h3>
              </div>
              {loading ? (
                <div className="pro-reports-empty"><div className="dash-spinner"></div></div>
              ) : conversations.length === 0 ? (
                <div className="pro-reports-empty" style={{ padding: "32px 16px" }}>
                  <i className="bi bi-chat-left-dots"></i>
                  <p style={{ fontSize: 13 }}>No conversations yet.<br/>Get assigned a supervisor first.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`msg-conv-item ${selectedConv?.id === conv.id ? "active" : ""}`}
                    onClick={() => setSelectedConv(conv)}
                  >
                    <div className="msg-conv-avatar">
                      {conv.other_user?.nom?.charAt(0) || "?"}
                    </div>
                    <div className="msg-conv-info">
                      <div className="msg-conv-name">{conv.other_user?.nom || "Unknown"}</div>
                      <div className="msg-conv-preview">{conv.last_message || "No messages yet"}</div>
                    </div>
                    {conv.unread > 0 && (
                      <span className="msg-unread-badge">{conv.unread}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Area */}
            <div className="msg-chat-area">
              {!selectedConv ? (
                <div className="msg-empty-state">
                  <i className="bi bi-chat-dots-fill"></i>
                  <h3>Select a conversation</h3>
                  <p>Choose a conversation from the left to start messaging</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="msg-chat-header">
                    <div className="msg-conv-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                      {selectedConv.other_user?.nom?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="msg-chat-name">{selectedConv.other_user?.nom}</div>
                      <div className="msg-chat-role">
                        {selectedConv.other_user?.role === "ENCADRANT" ? "Supervisor" : selectedConv.other_user?.role || ""}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="msg-messages">
                    {messages.length === 0 ? (
                      <div className="msg-empty-state" style={{ background: "none" }}>
                        <i className="bi bi-chat-right-text"></i>
                        <p>No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser.id;
                        const showDate = idx === 0 || formatDate(msg.created_at) !== formatDate(messages[idx-1]?.created_at);
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="msg-date-divider">
                                <span>{formatDate(msg.created_at)}</span>
                              </div>
                            )}
                            <div className={`msg-bubble-wrap ${isMe ? "me" : "them"}`}>
                              <div className={`msg-bubble ${isMe ? "msg-bubble-me" : "msg-bubble-them"} ${msg.pending ? "pending" : ""}`}>
                                {msg.content}
                                <span className="msg-time">{formatTime(msg.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef}></div>
                  </div>

                  {/* Input */}
                  <div className="msg-input-area">
                    <textarea
                      className="msg-input"
                      placeholder="Type a message... (Enter to send)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button
                      className="msg-send-btn"
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                    >
                      <i className="bi bi-send-fill"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .msg-layout { display: flex; height: calc(100vh - 80px); overflow: hidden; }
        .msg-sidebar {
          width: 280px; flex-shrink: 0; border-right: 1px solid var(--border);
          display: flex; flex-direction: column; background: white;
        }
        .msg-sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); }
        .msg-sidebar-header h3 { margin: 0; font-size: 16px; }
        .msg-conv-item {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; cursor: pointer; transition: background 0.15s;
          border-bottom: 1px solid var(--border);
        }
        .msg-conv-item:hover { background: var(--light-bg); }
        .msg-conv-item.active { background: var(--primary-soft); }
        .msg-conv-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px; flex-shrink: 0;
        }
        .msg-conv-info { flex: 1; min-width: 0; }
        .msg-conv-name { font-weight: 600; font-size: 14px; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-conv-preview { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-unread-badge {
          background: var(--primary); color: white;
          border-radius: 999px; padding: 2px 7px; font-size: 11px; font-weight: 700;
        }
        .msg-chat-area { flex: 1; display: flex; flex-direction: column; background: var(--light-bg); }
        .msg-chat-header {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px; background: white; border-bottom: 1px solid var(--border);
        }
        .msg-chat-name { font-weight: 700; font-size: 15px; }
        .msg-chat-role { font-size: 12px; color: var(--muted); }
        .msg-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 4px; }
        .msg-empty-state {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: var(--muted); gap: 12px; text-align: center;
        }
        .msg-empty-state i { font-size: 48px; opacity: 0.4; }
        .msg-empty-state h3 { margin: 0; font-size: 18px; color: var(--dark); }
        .msg-empty-state p { margin: 0; font-size: 14px; }
        .msg-date-divider { text-align: center; margin: 12px 0; }
        .msg-date-divider span {
          background: var(--border); color: var(--muted);
          border-radius: 999px; padding: 3px 12px; font-size: 11px; font-weight: 600;
        }
        .msg-bubble-wrap { display: flex; }
        .msg-bubble-wrap.me { justify-content: flex-end; }
        .msg-bubble-wrap.them { justify-content: flex-start; }
        .msg-bubble {
          max-width: 65%; padding: 10px 14px; border-radius: 16px;
          font-size: 14px; line-height: 1.5; position: relative;
          margin-bottom: 4px;
        }
        .msg-bubble-me { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .msg-bubble-them { background: white; color: var(--dark); border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .msg-bubble.pending { opacity: 0.7; }
        .msg-time { display: block; font-size: 10px; margin-top: 4px; opacity: 0.65; text-align: right; }
        .msg-input-area {
          display: flex; align-items: flex-end; gap: 10px;
          padding: 16px 20px; background: white; border-top: 1px solid var(--border);
        }
        .msg-input {
          flex: 1; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 12px;
          font-size: 14px; font-family: inherit; resize: none; outline: none;
          transition: border 0.15s; max-height: 120px;
        }
        .msg-input:focus { border-color: var(--primary); }
        .msg-send-btn {
          width: 44px; height: 44px; border-radius: 12px; border: none;
          background: var(--primary); color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
          transition: all 0.15s; flex-shrink: 0;
        }
        .msg-send-btn:hover { background: var(--primary-dark); }
        .msg-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default Messages;