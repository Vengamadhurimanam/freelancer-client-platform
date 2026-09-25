import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MessageSquare, Send, User } from 'lucide-react';

const FreelancerMessages = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeConv) return;

    socket.emit('join_conversation', { conversationId: activeConv._id });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_typing', (data) => {
      if (data.isTyping && data.userId !== user._id) {
        setTypingUser(data.userName);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConv._id });
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, activeConv?._id, user?._id]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          const target = res.data.conversations[0];
          setActiveConv(target);
          fetchMessages(target._id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch {
      // ignore
    }
  };

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    fetchMessages(conv._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const recipient = activeConv.participants?.find((p) => p._id !== user._id);
    if (!recipient) return;

    if (socket) {
      socket.emit('send_message', {
        conversationId: activeConv._id,
        senderId: user._id,
        recipientId: recipient._id,
        text: text.trim(),
      });
      setText('');
    } else {
      try {
        const res = await api.post('/messages', {
          conversationId: activeConv._id,
          recipientId: recipient._id,
          text: text.trim(),
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
          setText('');
        }
      } catch {
        // ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your messages..." />
      </div>
    );
  }

  const otherParticipant = activeConv?.participants?.find((p) => p._id !== user._id);
  const isRecipientOnline = otherParticipant && onlineUsers?.has(otherParticipant._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="saas-card bg-white h-[650px] flex overflow-hidden">
        {/* Left Side: Conversations List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No active discussions</div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.participants?.find((p) => p._id !== user._id);
                const isSelected = activeConv?._id === conv._id;
                const isOnline = partner && onlineUsers?.has(partner._id);

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConv(conv)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            partner?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {isOnline && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {partner?.name || 'Client'}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {partner?.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage?.text || 'Start chatting...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="w-2/3 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      otherParticipant?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{otherParticipant?.name}</h3>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isRecipientOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      {isRecipientOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {typingUser && (
                  <span className="text-[11px] text-blue-600 italic">{typingUser} is typing...</span>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-1 px-1">
                        {msg.sender?.name || (isMine ? 'You' : 'Collaborator')} •{' '}
                        {formatDateTime(msg.createdAt)}
                      </div>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="saas-btn-primary text-xs py-2 px-5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerMessages;
