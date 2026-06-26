import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Phone, Check, CheckCheck, HelpCircle } from 'lucide-react';
import { ChatMessage, User as AppUser } from '../types';

interface ChatWidgetProps {
  currentUser: AppUser | null;
  messages: ChatMessage[];
  onSendMessage: (text: string, clientInfo?: { name: string; phone: string }) => void;
}

export default function ChatWidget({ currentUser, messages, onSendMessage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Guest registration states
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('cpn_chat_registered') === 'true' || !!currentUser;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync isRegistered if user logs in
  useEffect(() => {
    if (currentUser) {
      setIsRegistered(true);
    }
  }, [currentUser]);

  // Determine current active threadId
  const getThreadId = (): string => {
    if (currentUser) return currentUser.id;
    const stored = localStorage.getItem('cpn_guest_thread_id');
    if (stored) return stored;
    const newId = 'guest-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cpn_guest_thread_id', newId);
    return newId;
  };

  const threadId = getThreadId();

  // Filter messages for current thread
  const threadMessages = messages.filter(m => m.threadId === threadId);

  // Scroll to bottom on new messages or open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [threadMessages.length, isOpen]);

  // Handle register guest
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;
    
    localStorage.setItem('cpn_guest_name', guestName);
    localStorage.setItem('cpn_guest_phone', guestPhone);
    localStorage.setItem('cpn_chat_registered', 'true');
    setIsRegistered(true);

    // Send initial welcome message trigger if input was ready, or just register
    if (inputText.trim()) {
      onSendMessage(inputText, { name: guestName, phone: guestPhone });
      setInputText('');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!isRegistered) {
      // Show form first, wait for submit
      return;
    }

    // Determine guest info if not logged in
    const storedName = localStorage.getItem('cpn_guest_name') || 'Visiteur';
    const storedPhone = localStorage.getItem('cpn_guest_phone') || '';

    onSendMessage(inputText, currentUser ? undefined : { name: storedName, phone: storedPhone });
    setInputText('');
  };

  // Get unread count for current thread (from admin)
  const unreadCount = threadMessages.filter(m => m.senderRole === 'admin' && !m.readByClient).length;

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      // Mark as read in localStorage / state
      threadMessages.forEach(m => {
        if (m.senderRole === 'admin') {
          m.readByClient = true;
        }
      });
      // Fire a storage event or update parent if needed, but simple client mutation works for local display
      localStorage.setItem('cpn_bookings_read_sync', Date.now().toString());
    }
  }, [isOpen, threadMessages, unreadCount]);

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="sms-chat-widget">
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        id="chat-toggle-btn"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <MessageSquare className="w-6 h-6 stroke-[2.5] group-hover:rotate-6 transition-transform" />
        )}
        
        {/* Unread Message Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-[#070707]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn"
          id="chat-window-box"
        >
          {/* Header */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 font-black text-sm">
                  IC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm tracking-wide">SMS & Messagerie Directe</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-zinc-400">Support Ici Ciné • En ligne</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-orange-500/5 border-b border-orange-500/10 py-2 px-4 text-center">
            <span className="text-[10px] text-orange-400/95 font-medium flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> Vos messages sont transmis directement à la direction du cinéma.
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0 bg-gradient-to-b from-zinc-950 to-zinc-900">
            {threadMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <MessageSquare className="w-6 h-6 text-orange-500/60" />
                </div>
                <div>
                  <h5 className="text-white text-xs font-bold">Démarrer une discussion</h5>
                  <p className="text-zinc-500 text-[10px] mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Posez vos questions sur les films, tarifs, horaires ou réservations. Notre équipe vous répond immédiatement.
                  </p>
                </div>
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isAdmin ? 'self-start text-left' : 'self-end text-right'
                    }`}
                  >
                    {/* Sender Name */}
                    <span className="text-[9px] text-zinc-500 font-mono mb-1 px-1">
                      {isAdmin ? 'Directeur (Ici Ciné)' : 'Vous'}
                    </span>
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'
                          : 'bg-orange-500 text-black font-medium rounded-tr-none shadow-md shadow-orange-500/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {/* Time & Read Status */}
                    <div className="flex items-center gap-1 mt-1 justify-end px-1">
                      <span className="text-[8px] text-zinc-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isAdmin && (
                        <span>
                          {msg.readByAdmin ? (
                            <CheckCheck className="w-3 h-3 text-sky-400" />
                          ) : (
                            <Check className="w-3 h-3 text-zinc-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Overlay for unregistered Guests */}
          {!isRegistered && (
            <div className="absolute inset-x-0 bottom-0 top-[60px] bg-zinc-950/95 backdrop-blur-sm flex flex-col justify-end p-5 animate-slideUp border-t border-zinc-800/50">
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5" />
                  </div>
                  <h5 className="text-white text-xs font-bold uppercase tracking-wider">Identifiez-vous pour écrire</h5>
                  <p className="text-zinc-400 text-[10px] mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Saisissez votre nom et téléphone afin que l'administrateur reçoive votre message et puisse vous répondre par SMS.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Votre Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Grace Tchiloemba"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Numéro WhatsApp / Téléphone</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +242 06 110 92 01"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-black font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Commencer la discussion
                </button>
              </form>
            </div>
          )}

          {/* Chat Input Footer */}
          {isRegistered && (
            <form onSubmit={handleSend} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Votre message ici..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-zinc-950 text-white rounded-xl p-2.5 text-xs border border-zinc-800 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2]" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
