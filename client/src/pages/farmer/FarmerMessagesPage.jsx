import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Store, ShieldCheck, Sprout } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FarmerMessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      if (res.data.success) {
        const list = res.data.conversations || [];
        setConversations(list);
        if (!activeConversation && list.length > 0) {
          setActiveConversation(list[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading conversations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.warn('Error fetching messages:', err.message);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      const interval = setInterval(() => fetchMessages(activeConversation._id), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    setSending(true);
    try {
      const res = await api.post(`/conversations/${activeConversation._id}/messages`, {
        text: messageText.trim(),
      });
      if (res.data.success) {
        setMessageText('');
        setMessages((prev) => [...prev, res.data.message]);
        fetchConversations();
      }
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your communications..." />;

  const getOtherParticipant = (conv) => {
    if (!conv?.participantIds) return { name: 'Commercial Trader' };
    return conv.participantIds.find((p) => p._id !== user?._id) || conv.participantIds[0];
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">Direct Communications</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Chat directly with commercial buyers regarding pickup timing, crates, and harvest specifications.
        </p>
      </div>

      <div className="card h-[600px] flex overflow-hidden border-agriborder bg-white">
        {/* Left Conversations Sidebar */}
        <div className="w-1/3 border-r border-agriborder flex flex-col">
          <div className="p-4 border-b border-agriborder">
            <h3 className="font-bold text-xs uppercase tracking-wider text-agritext-secondary">
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-agriborder/60">
            {conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isActive ? 'bg-agrigreen-50/70 border-l-4 border-forest' : 'hover:bg-cream/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                    {other?.name?.charAt(0) || 'B'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-agritext-main truncate">
                        {other?.name}
                      </span>
                      <span className="text-[10px] text-agritext-muted">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-agritext-secondary truncate mt-0.5">
                      {conv.lastMessageText || 'Produce negotiation discussion'}
                    </p>
                  </div>
                </button>
              );
            })}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-xs text-agritext-secondary">
                No active conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Thread Window */}
        <div className="flex-1 flex flex-col bg-cream/30">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-agriborder flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center uppercase">
                    {getOtherParticipant(activeConversation)?.name?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-agritext-main block">
                      {getOtherParticipant(activeConversation)?.name}
                    </span>
                    <span className="text-[10px] text-forest font-semibold">
                      {getOtherParticipant(activeConversation)?.role?.toUpperCase()} ACCOUNT
                    </span>
                  </div>
                </div>

                {activeConversation.listingId && (
                  <span className="text-xs bg-agrigreen-50 text-forest px-2.5 py-1 rounded-lg border border-agrigreen-200 font-medium">
                    Regarding: {activeConversation.listingId.cropName}
                  </span>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-forest text-white rounded-br-none'
                            : 'bg-white border border-agriborder text-agritext-main rounded-bl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-agritext-muted mt-1 px-1">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-agriborder flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your message to the buyer..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="input-field text-xs py-2"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-agritext-secondary">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerMessagesPage;
