import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
  Activity,
  HeartPulse,
  Video,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorMessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const res = await API.get('/messages/contacts/list');
      if (res.data?.success) {
        const list = res.data.contacts || [];
        setContacts(list);
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [selectedContact]);

  const fetchConversation = useCallback(async (contactId) => {
    if (!contactId) return;
    try {
      setLoadingMessages(true);
      const res = await API.get(`/messages/${contactId}`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (selectedContact?._id) {
      fetchConversation(selectedContact._id);
      const interval = setInterval(() => {
        fetchConversation(selectedContact._id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContact, fetchConversation]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket || !selectedContact?._id) return;

    const handleNewMessage = (newMsg) => {
      if (
        (newMsg.senderId?._id === selectedContact._id && newMsg.recipientId?._id === user?._id) ||
        (newMsg.senderId?._id === user?._id && newMsg.recipientId?._id === selectedContact._id)
      ) {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, selectedContact, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact?._id) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      setSending(true);
      const res = await API.post('/messages', {
        recipientId: selectedContact._id,
        messageText: textToSend,
      });

      if (res.data?.success && res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left: Patient List */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <h2 className="text-sm font-black text-slate-900">Patient Messages</h2>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingContacts ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Activity className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                Loading patients...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations found.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    selectedContact?._id === contact._id
                      ? 'bg-teal-50/80 border-r-2 border-teal-600'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {contact.name?.charAt(0) || 'P'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{contact.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {selectedContact.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {selectedContact.name}
                    </h3>
                    <p className="text-[11px] text-teal-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Consultation Channel
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/doctor/records')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Records</span>
                  </button>

                  <button
                    onClick={() => navigate(`/consultation/room-${user?._id.substring(0, 6)}`)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Start Video</span>
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">No messages yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Begin communication with {selectedContact.name} regarding treatment plans or lab results.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isSelf && (
                          <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                            {selectedContact.name?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                            isSelf
                              ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.messageText}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isSelf ? 'text-teal-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isSelf && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type clinical instructions or reply..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50 font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">Select a patient to start messaging</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Provide real-time clinical guidance, follow-up instructions, and care coordination.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagesPage;
