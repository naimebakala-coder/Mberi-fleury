/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Calendar, MapPin, Phone, Mail, Clock, Info, Armchair, 
  ChevronRight, Sparkles, Star, Film, Sliders, ChevronDown, Check, Ticket
} from 'lucide-react';

import { Movie, Showtime, TicketPrice, Booking, User, WeeklyScheduleItem, ChatMessage } from './types';
import { 
  INITIAL_MOVIES, INITIAL_SHOWTIMES, INITIAL_PRICES, 
  INITIAL_WEEKLY_SCHEDULE, INITIAL_BOOKINGS, INITIAL_CHATS
} from './data';

import Header from './components/Header';
import SeatingMap from './components/SeatingMap';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import ChatWidget from './components/ChatWidget';


export default function App() {
  // --- Persistent States from LocalStorage ---
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('cpn_movies');
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  const [showtimes, setShowtimes] = useState<Showtime[]>(() => {
    const saved = localStorage.getItem('cpn_showtimes');
    return saved ? JSON.parse(saved) : INITIAL_SHOWTIMES;
  });

  const [prices, setPrices] = useState<TicketPrice[]>(() => {
    const saved = localStorage.getItem('cpn_prices');
    return saved ? JSON.parse(saved) : INITIAL_PRICES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('cpn_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cpn_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('cpn_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  // --- UI Filter & Navigation States ---

  const [activeSection, setActiveSection] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionTab, setSelectedSessionTab] = useState<'today' | 'tomorrow' | 'sunday' | 'monday'>('today');
  const [selectedSecondaryTab, setSelectedSecondaryTab] = useState<'planning' | 'presentation' | 'photos' | 'contact'>('planning');
  const [movieFilterType, setMovieFilterType] = useState<'all' | 'film' | 'serie' | 'dessin'>('all');

  // --- Modal & Selection States ---
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedShowtimeForBooking, setSelectedShowtimeForBooking] = useState<Showtime | null>(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);

  // --- Save states on modification ---
  useEffect(() => {
    localStorage.setItem('cpn_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cpn_showtimes', JSON.stringify(showtimes));
  }, [showtimes]);

  useEffect(() => {
    localStorage.setItem('cpn_prices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem('cpn_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cpn_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cpn_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cpn_chat_messages', JSON.stringify(messages));
    window.dispatchEvent(new Event('localStorageSync'));
  }, [messages]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('cpn_chat_messages');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageSync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageSync', handleStorageChange);
    };
  }, []);


  // --- Auth Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSection('home');
  };

  // --- Favorite Toggle Handler ---
  const handleToggleFavorite = (movieId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening details card
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const updatedUser = { ...currentUser };
    if (updatedUser.favorites.includes(movieId)) {
      updatedUser.favorites = updatedUser.favorites.filter(id => id !== movieId);
    } else {
      updatedUser.favorites = [...updatedUser.favorites, movieId];
    }
    setCurrentUser(updatedUser);
  };

  // --- Seating Booking Handler ---
  const handleBookSeats = (showtimeId: string, seats: string[], category: string, totalPrice: number) => {
    if (!currentUser) return;

    // 1. Mark seats as booked in showtime state
    const updatedShowtimes = showtimes.map(st => {
      if (st.id === showtimeId) {
        return {
          ...st,
          bookedSeats: [...st.bookedSeats, ...seats]
        };
      }
      return st;
    });
    setShowtimes(updatedShowtimes);

    // 2. Create the Booking entry
    const targetShowtime = showtimes.find(st => st.id === showtimeId)!;
    const newBooking: Booking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      showtimeId: showtimeId,
      movieId: targetShowtime.movieId,
      movieTitle: targetShowtime.movieTitle,
      time: targetShowtime.time,
      day: targetShowtime.day === 'today' ? "Aujourd'hui" : targetShowtime.day === 'tomorrow' ? "Demain" : targetShowtime.day === 'sunday' ? "Dimanche" : "Lundi",
      seats: seats,
      totalPrice: totalPrice,
      createdAt: new Date().toISOString(),
      category: category
    };

    setBookings([newBooking, ...bookings]);
    setSelectedShowtimeForBooking(null);

    alert(`Félicitations ${currentUser.name} ! Vos places (${seats.join(', ')}) pour ${targetShowtime.movieTitle} ont été réservées avec succès !`);
  };

  // --- Admin Handlers ---
  const handleAddMovie = (newMovieData: Omit<Movie, 'id'>) => {
    const newId = 'm_' + Date.now();
    const newMovie: Movie = {
      id: newId,
      ...newMovieData
    };
    setMovies([newMovie, ...movies]);

    // Create a default showtime for this movie so it's instantly bookable
    const newShowtime: Showtime = {
      id: 's_new_' + Date.now(),
      movieId: newId,
      movieTitle: newMovie.title,
      time: '19h00',
      day: 'today',
      price: 2500,
      capacity: 64,
      bookedSeats: []
    };
    setShowtimes([newShowtime, ...showtimes]);
  };

  const handleRemoveMovie = (movieId: string) => {
    setMovies(movies.filter(m => m.id !== movieId));
    // Clean up corresponding showtimes
    setShowtimes(showtimes.filter(st => st.movieId !== movieId));
  };

  const handleUpdatePrice = (priceId: string, newPrice: number) => {
    setPrices(prices.map(p => p.id === priceId ? { ...p, price: newPrice } : p));
  };

  // --- Message & Chat Handlers ---
  const handleSendMessage = (text: string, clientInfo?: { name: string; phone: string }) => {
    let threadId = '';
    let senderId = '';
    let senderName = '';
    let senderRole: 'admin' | 'client' | 'guest' = 'guest';
    let phoneNumber = '';
    let email = '';

    if (currentUser) {
      threadId = currentUser.id;
      senderId = currentUser.id;
      senderName = currentUser.name;
      senderRole = 'client';
      email = currentUser.email;
    } else {
      const storedThreadId = localStorage.getItem('cpn_guest_thread_id');
      threadId = storedThreadId || 'guest-' + Math.random().toString(36).substr(2, 9);
      if (!storedThreadId) {
        localStorage.setItem('cpn_guest_thread_id', threadId);
      }
      senderId = 'guest-' + threadId;
      senderName = clientInfo?.name || localStorage.getItem('cpn_guest_name') || 'Visiteur';
      senderRole = 'guest';
      phoneNumber = clientInfo?.phone || localStorage.getItem('cpn_guest_phone') || '';
    }

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      threadId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toISOString(),
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      readByAdmin: false,
      readByClient: true
    };

    setMessages(prev => [...prev, newMessage]);

    // Setup an automated friendly system reply after 1.5s
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        threadId,
        senderId: 'admin',
        senderName: 'Directeur (Ici Ciné)',
        senderRole: 'admin',
        text: `👋 Bonjour ! Nous avons bien reçu votre message : "${text.slice(0, 45)}${text.length > 45 ? '...' : ''}". Un agent d'Ici Ciné étudie votre demande et vous répondra sur ce chat ou par SMS au ${phoneNumber || '+242 06 666 55 44'}. Merci pour votre confiance ! 🍿`,
        timestamp: new Date().toISOString(),
        readByAdmin: true,
        readByClient: false
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1500);
  };

  const handleSendReply = (threadId: string, text: string) => {
    const newReply: ChatMessage = {
      id: 'msg-' + Date.now(),
      threadId,
      senderId: 'admin',
      senderName: 'Directeur (Ici Ciné)',
      senderRole: 'admin',
      text,
      timestamp: new Date().toISOString(),
      readByAdmin: true,
      readByClient: false
    };

    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.threadId === threadId && m.senderRole !== 'admin') {
          return { ...m, readByAdmin: true };
        }
        return m;
      });
      return [...updated, newReply];
    });
  };

  // --- Computed Filters ---

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilterType = movieFilterType === 'all' || movie.type === movieFilterType;
    return matchesSearch && matchesFilterType;
  });

  const getShowtimesForTab = (tab: 'today' | 'tomorrow' | 'sunday' | 'monday') => {
    return showtimes.filter(st => st.day === tab);
  };

  const getMovieById = (id: string): Movie | undefined => {
    return movies.find(m => m.id === id);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-black">
      
      {/* Header component */}
      <Header 
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSearch={(query) => { setSearchQuery(query); setActiveSection('home'); }}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* ADMIN WORKSPACE VIEW */}
      {activeSection === 'admin' && currentUser?.role === 'admin' && (
        <div className="py-8 px-4 md:px-8 flex-1">
          <AdminDashboard 
            movies={movies}
            showtimes={showtimes}
            prices={prices}
            bookings={bookings}
            messages={messages}
            onAddMovie={handleAddMovie}
            onRemoveMovie={handleRemoveMovie}
            onUpdatePrice={handleUpdatePrice}
            onSendReply={handleSendReply}
          />
        </div>
      )}

      {/* CLIENT BOOKINGS ARCHIVE */}
      {activeSection === 'reservations' && currentUser?.role === 'client' && (
        <div className="py-10 px-4 md:px-8 flex-1 max-w-4xl mx-auto w-full animate-fadeIn">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-orange-500" />
              Mes Billets et Projections Réservées
            </h2>
            <p className="text-zinc-400 text-xs mb-6">Retrouvez l'historique complet de vos réservations effectuées au Culture Parc Ndjindji.</p>

            {bookings.filter(b => b.userId === currentUser.id).length > 0 ? (
              <div className="flex flex-col gap-4">
                {bookings.filter(b => b.userId === currentUser.id).map(booking => (
                  <div 
                    key={booking.id}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-orange-500 to-orange-600" />
                    
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center text-orange-500">
                        <Film className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{booking.movieTitle}</h4>
                        <p className="text-orange-500 text-xs font-mono mt-0.5">{booking.day} • {booking.time}</p>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-1">ID Réservation: #{booking.id}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-zinc-900 pt-3 sm:pt-0">
                      <div className="flex flex-wrap gap-1">
                        {booking.seats.map(s => (
                          <span key={s} className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                            Siège {s}
                          </span>
                        ))}
                      </div>
                      <span className="text-white font-black text-xs font-mono sm:mt-2 block">
                        {booking.totalPrice.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono bg-zinc-950 rounded-xl border border-zinc-850">
                Vous n'avez pas encore réservé de place pour une projection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN PUBLIC SCREEN PORTAL */}
      {(activeSection === 'home' || activeSection === 'agenda' || activeSection === 'films' || activeSection === 'secondary') && (
        <main className="flex-1">
          
          {/* HERO BANNER & PRESENTATION */}
          {activeSection === 'home' && (
            <section className="relative px-4 md:px-8 py-12 md:py-16 bg-gradient-to-b from-zinc-950 to-[#070707] border-b border-zinc-800 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.04),transparent_50%)]" />
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                
                {/* Text Presentation */}
                <div className="flex-1 max-w-2xl text-left">
                  <span className="text-orange-500 text-xs font-mono font-black uppercase tracking-widest block mb-2">
                    Culture Parc Ndjindji | Pointe-Noire
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                    Le Cinéma au Cœur de <span className="text-orange-500">Pointe-Noire</span>
                  </h1>
                  <p className="text-zinc-400 text-sm md:text-base mt-4 leading-relaxed">
                    Culture Parc Ndjindji est une salle de cinéma de premier plan située à Pointe-Noire, dans la République du Congo. Profitez d'une expérience audiovisuelle immersive avec des projections haute fidélité, des sièges ultra-confortables et une programmation variée pour toute la famille.
                  </p>
                  
                  {/* Stats highlights */}
                  <div className="flex gap-6 mt-8">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black font-mono text-orange-500">2 500<span className="text-xs"> FCFA</span></span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Tarif Standard</span>
                    </div>
                    <div className="w-px bg-zinc-800" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-black font-mono text-white">4K UHD</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Qualité d'Image</span>
                    </div>
                    <div className="w-px bg-zinc-800" />
                    <div className="flex flex-col">
                      <span className="text-2xl font-black font-mono text-white">64</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Places Disponibles</span>
                    </div>
                  </div>
                </div>

                {/* Right: Circle Logo Culture Parc */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-orange-500/10 border-4 border-zinc-800 transition-transform hover:rotate-3 duration-300">
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      {/* Stylized circle mimicking the reference screenshot */}
                      <span className="text-black font-black text-lg md:text-xl uppercase tracking-tighter leading-none">
                        CULTURE PARC
                      </span>
                      <span className="text-orange-500 font-black text-[9px] md:text-[10px] tracking-widest mt-1 uppercase">
                        Loisirs & Divertissements
                      </span>
                      <div className="w-12 h-0.5 bg-zinc-200 my-2" />
                      <span className="text-zinc-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wide">
                        Pointe-Noire
                      </span>
                    </div>
                    
                    {/* Tiny glowing dot */}
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* SESSIONS SECTION (Séances du jour) */}
          {(activeSection === 'home' || activeSection === 'agenda') && (
            <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto border-b border-zinc-800" id="sessions-section">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                  <span className="text-orange-500 text-xs font-mono font-bold uppercase tracking-widest block mb-1">
                    Sélections & Horaires
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Séances et Programme</h2>
                </div>

                {/* Sessions Tabs */}
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 border border-zinc-800/80 rounded-xl">
                  {(['today', 'tomorrow', 'sunday', 'monday'] as const).map(tab => (
                    <button
                      key={tab}
                      id={`session-tab-${tab}`}
                      onClick={() => setSelectedSessionTab(tab)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSessionTab === tab 
                          ? 'bg-orange-500 text-black font-extrabold' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab === 'today' ? "Aujourd'hui" : tab === 'tomorrow' ? "Demain" : tab === 'sunday' ? "Ce Dimanche" : "Ce Lundi"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session cards list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="sessions-cards-container">
                {getShowtimesForTab(selectedSessionTab).map(showtime => {
                  const movie = getMovieById(showtime.movieId);
                  const availableSeats = showtime.capacity - showtime.bookedSeats.length;

                  return (
                    <div 
                      key={showtime.id}
                      onClick={() => setSelectedShowtimeForBooking(showtime)}
                      className="bg-[#0a0a0a] border border-zinc-800/80 hover:border-orange-500 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 group flex flex-col justify-between h-44"
                      id={`session-card-${showtime.id}`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-white text-sm font-black font-mono tracking-tight flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            {showtime.time}
                          </span>
                          <span className="bg-orange-500/10 text-orange-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-orange-500/20">
                            {showtime.price.toLocaleString()} XAF
                          </span>
                        </div>
                        <h3 className="text-white text-base font-bold group-hover:text-orange-500 transition-colors line-clamp-1">
                          {showtime.movieTitle}
                        </h3>
                        {movie && <p className="text-zinc-400 text-xs mt-1 truncate">{movie.genre}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-900/80 text-[11px] font-mono mt-2">
                        <span className={availableSeats > 5 ? "text-zinc-400" : "text-orange-500 font-bold"}>
                          {availableSeats} places libres
                        </span>
                        <span className="text-orange-500 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          Réserver <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {getShowtimesForTab(selectedSessionTab).length === 0 && (
                  <div className="col-span-full py-10 text-center text-zinc-500 text-xs font-mono border border-dashed border-zinc-800 rounded-xl">
                    Aucune projection planifiée pour ce jour.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* FILMS SECTION (Films à l'affiche) */}
          {(activeSection === 'home' || activeSection === 'films') && (
            <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto" id="movies-section">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                  <span className="text-orange-500 text-xs font-mono font-bold uppercase tracking-widest block mb-1">
                    Grand Écran
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Films à l'Affiche</h2>
                  <p className="text-zinc-400 text-xs mt-1">Découvrez la liste des films, séries et dessins animés projetés au Culture Parc.</p>
                </div>

                {/* Movie categories filter */}
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 border border-zinc-800/80 rounded-xl">
                  {[
                    { id: 'all', label: 'Tout' },
                    { id: 'film', label: 'Films' },
                    { id: 'serie', label: 'Séries' },
                    { id: 'dessin', label: 'Dessins Animés' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      id={`movie-filter-${tab.id}`}
                      onClick={() => setMovieFilterType(tab.id as any)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        movieFilterType === tab.id 
                          ? 'bg-orange-500 text-black font-extrabold' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Movies Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6" id="movies-catalog-grid">
                {filteredMovies.map(movie => {
                  const isFav = currentUser?.favorites.includes(movie.id) || false;

                  return (
                    <div 
                      key={movie.id}
                      id={`movie-card-${movie.id}`}
                      onClick={() => setSelectedMovieForDetails(movie)}
                      className="group flex flex-col cursor-pointer bg-zinc-950/20 rounded-xl p-1.5 border border-transparent hover:border-zinc-800 transition-all hover:bg-zinc-950/40"
                    >
                      {/* Poster image container */}
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-850">
                        <img 
                          src={movie.poster} 
                          alt={movie.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Favorite Heart Trigger */}
                        <button
                          id={`toggle-fav-${movie.id}`}
                          onClick={(e) => handleToggleFavorite(movie.id, e)}
                          className="absolute top-2.5 right-2.5 p-2 bg-black/60 hover:bg-black/85 backdrop-blur-sm rounded-full text-white transition-colors animate-fadeIn"
                          title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-orange-500 text-orange-500' : 'text-zinc-300'}`} />
                        </button>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
                          <span className="text-orange-500 text-[9px] font-mono uppercase tracking-wider block font-bold mb-1">
                            {movie.type === 'dessin' ? 'Dessin Animé' : movie.type}
                          </span>
                          <span className="text-white text-xs font-bold font-mono block">
                            Durée : {movie.duration}
                          </span>
                          <span className="text-zinc-400 text-[10px] font-mono mt-0.5">
                            Format : {movie.version}
                          </span>
                          <span className="text-[10px] text-orange-500 font-bold mt-2 uppercase flex items-center gap-0.5">
                            Voir détails <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {/* Movie text labels */}
                      <div className="mt-3 text-left">
                        <h4 className="text-white text-sm font-bold truncate group-hover:text-orange-500 transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-orange-500 text-xs font-medium truncate mt-0.5">
                          {movie.genre}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredMovies.length === 0 && (
                  <div className="col-span-full py-16 text-center text-zinc-500 text-xs font-mono">
                    Aucun film ne correspond à votre recherche ou catégorie.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SECONDARY INTERACTIVE MENU & INFORMATION CARDS */}
          <section className="py-12 bg-zinc-950 border-t border-b border-zinc-900 px-4 md:px-8" id="secondary-section">
            <div className="max-w-7xl mx-auto">
              
              {/* Secondary navigation tabs */}
              <div className="flex border-b border-zinc-900 mb-8 overflow-x-auto gap-6 pb-2" id="secondary-tabs-bar">
                {[
                  { id: 'planning', label: 'Planning hebdomadaire' },
                  { id: 'presentation', label: 'Présentation & Tarifs' },
                  { id: 'photos', label: 'Photos du Cinéma' },
                  { id: 'contact', label: 'Informations de contact' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    id={`secondary-tab-${tab.id}`}
                    onClick={() => setSelectedSecondaryTab(tab.id as any)}
                    className={`text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap pb-3 border-b-2 relative cursor-pointer ${
                      selectedSecondaryTab === tab.id 
                        ? 'text-orange-500 border-orange-500' 
                        : 'text-zinc-400 border-transparent hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 1. WEEKLY PLANNING MATRIX */}
              {selectedSecondaryTab === 'planning' && (
                <div className="animate-fadeIn" id="weekly-program-container">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-white font-extrabold text-lg">Programme de la Semaine</h3>
                      <p className="text-zinc-400 text-xs mt-0.5">Semaine du 23 juin au 28 juin 2026 • Projections organisées du mardi au dimanche.</p>
                    </div>
                    <span className="bg-orange-950/20 text-orange-500 border border-orange-900/50 text-xs font-mono font-bold py-1.5 px-3 rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Version Française (VF)
                    </span>
                  </div>

                  {/* Responsive table */}
                  <div className="overflow-x-auto bg-[#080808] border border-zinc-900 rounded-xl shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-400 font-mono">
                          <th className="py-4 px-5">Film à l'Affiche</th>
                          <th className="py-4 px-4 text-center">Durée & Genre</th>
                          <th className="py-4 px-3 text-center text-orange-500">Mardi</th>
                          <th className="py-4 px-3 text-center text-orange-500">Mercredi</th>
                          <th className="py-4 px-3 text-center text-orange-500">Jeudi</th>
                          <th className="py-4 px-3 text-center text-orange-500">Vendredi</th>
                          <th className="py-4 px-3 text-center text-orange-500">Samedi</th>
                          <th className="py-4 px-3 text-center text-orange-500">Dimanche</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50 text-zinc-350">
                        {INITIAL_WEEKLY_SCHEDULE.map(item => (
                          <tr key={item.id} className="hover:bg-zinc-900/30">
                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-sm">{item.movieTitle}</span>
                                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.version}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-1 rounded block w-max mx-auto mb-1">
                                {item.duration}
                              </span>
                              <span className="text-zinc-400 text-[10px] block truncate max-w-[120px] mx-auto">{item.genre}</span>
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-white">
                              {item.mardi || '—'}
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-white">
                              {item.mercredi || '—'}
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-white">
                              {item.jeudi || '—'}
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-white">
                              {item.vendredi || '—'}
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-white">
                              {item.samedi || '—'}
                            </td>
                            <td className="py-4 px-3 text-center font-mono text-xs font-bold text-orange-500">
                              {item.dimanche || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. DETAILED PRESENTATION & PRICING */}
              {selectedSecondaryTab === 'presentation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn" id="presentation-pricing-container">
                  {/* Presentation info */}
                  <div className="space-y-4">
                    <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-orange-500" />
                      À propos de la salle Culture Parc Ndjindji
                    </h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      La salle de cinéma Culture Parc Ndjindji est un espace culturel de Pointe-Noire qui s'engage à offrir une nouvelle façon de se divertir dans un cadre moderne, hautement sécurisé et climatisé.
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Équipée d'une technologie de projection 4K numérique de dernière génération, d'un traitement d'écran à haute réflexion lumineuse et d'un système de sonorisation surround immersif, elle est idéale pour vivre intensément les blockbusters internationaux, les films indépendants congolais et les œuvres destinées au jeune public.
                    </p>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-300 text-xs leading-relaxed">
                      📌 <strong>Aménagements :</strong> Espace confiserie disponible, accès PMR, climatisation intégrale, parking surveillé par des agents qualifiés.
                    </div>
                  </div>

                  {/* Complete detailed pricing card */}
                  <div className="bg-[#080808] border border-zinc-900 rounded-2xl p-6">
                    <h4 className="text-orange-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Tarifs Officiels des Projections
                    </h4>
                    
                    <div className="divide-y divide-zinc-900 flex flex-col">
                      {prices.map(price => (
                        <div key={price.id} className="py-3 flex justify-between items-center">
                          <span className="text-zinc-350 text-xs font-bold">{price.label}</span>
                          <span className="text-orange-500 font-mono font-bold text-sm">
                            {price.price.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed font-mono">
                      *Note: Les billets achetés ne sont ni échangeables ni remboursables. Veuillez arriver au moins 15 minutes avant le début de la projection.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. HIGH FIDELITY CINEMA PHOTOS */}
              {selectedSecondaryTab === 'photos' && (
                <div className="space-y-4 animate-fadeIn" id="photos-gallery-container">
                  <div>
                    <h3 className="text-white font-extrabold text-lg">Visite Virtuelle</h3>
                    <p className="text-neutral-400 text-xs">Découvrez l'environnement luxueux du Culture Parc Ndjindji à Pointe-Noire.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        title: 'La Salle Principale', 
                        desc: 'Fauteuils confortables et acoustique soignée', 
                        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500' 
                      },
                      { 
                        title: 'Le Projecteur Laser', 
                        desc: 'Qualité d\'image 4K UHD exceptionnelle', 
                        url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=500' 
                      },
                      { 
                        title: 'Espace Confiserie', 
                        desc: 'Popcorn chaud, confiseries et boissons fraîches', 
                        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=500' 
                      },
                      { 
                        title: 'Hall d\'Accueil', 
                        desc: 'Espace d\'attente climatisé et moderne', 
                        url: 'https://images.unsplash.com/photo-1478720143033-6a972678aa30?auto=format&fit=crop&q=80&w=500' 
                      }
                    ].map((photo, index) => (
                      <div 
                        key={index} 
                        className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md"
                      >
                        <div className="aspect-video relative overflow-hidden bg-zinc-950">
                          <img 
                            src={photo.url} 
                            alt={photo.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-3 text-left">
                          <h4 className="text-white text-xs font-bold">{photo.title}</h4>
                          <p className="text-zinc-400 text-[10px] mt-0.5">{photo.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CONTACT INFOS & ADDRESS */}
              {selectedSecondaryTab === 'contact' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="contact-infos-container">
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 text-left space-y-3">
                    <div className="text-orange-500 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Adresse Physique</h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Avenue Denis Sassou Nguesso,<br />
                        Face Bralico, Pointe-Noire,<br />
                        République du Congo
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 text-left space-y-3">
                    <div className="text-orange-500 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Téléphone & Réservation</h4>
                      <p className="text-zinc-400 text-xs mt-1 font-mono">
                        +242 06 110 92 01<br />
                        +242 05 550 11 22
                      </p>
                      <span className="text-[10px] text-orange-500 block mt-2 font-bold uppercase">Appels et WhatsApp</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 text-left space-y-3">
                    <div className="text-orange-500 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Courriel Électronique</h4>
                      <p className="text-zinc-400 text-xs mt-1 font-mono">
                        contact@cultureparc-ndjindji.cg<br />
                        direction@icicine.cg
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-[#080808] border-t border-zinc-900 py-8 px-4 text-center text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Ici Ciné — Culture Parc Ndjindji. Tous droits réservés.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="text-orange-500">POINTE-NOIRE, CONGO</span>
            <span>•</span>
            <span>POLITIQUE DE CONFIDENTIALITÉ</span>
          </div>
        </div>
      </footer>

      {/* --- FLOATING OVERLAYS & MODALS --- */}
      <AnimatePresence>
        
        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
          />
        )}

        {/* Seating Map Dialog overlay */}
        {selectedShowtimeForBooking && (
          <SeatingMap 
            showtime={selectedShowtimeForBooking}
            movie={getMovieById(selectedShowtimeForBooking.movieId)!}
            prices={prices}
            currentUser={currentUser}
            onClose={() => setSelectedShowtimeForBooking(null)}
            onBookSeats={handleBookSeats}
            onOpenAuth={() => {
              setSelectedShowtimeForBooking(null);
              setShowAuthModal(true);
            }}
          />
        )}

        {/* Movie Detail Dialog overlay */}
        {selectedMovieForDetails && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 relative">
              
              <button 
                id="close-details-modal"
                onClick={() => setSelectedMovieForDetails(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer text-xl font-bold"
              >
                ×
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster img */}
                <div className="w-full md:w-48 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  <img 
                    src={selectedMovieForDetails.poster} 
                    alt={selectedMovieForDetails.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details text info */}
                <div className="flex-1 text-left flex flex-col justify-between">
                  <div>
                    <span className="text-orange-500 text-xs font-mono font-bold uppercase tracking-wider block mb-1">
                      {selectedMovieForDetails.type === 'dessin' ? 'Dessin Animé' : selectedMovieForDetails.type}
                    </span>
                    <h3 className="text-white text-xl font-black">{selectedMovieForDetails.title}</h3>
                    <span className="text-orange-500 text-xs font-bold mt-1 block">{selectedMovieForDetails.genre}</span>
                    
                    <div className="flex gap-4 text-xs text-zinc-400 mt-2 font-mono">
                      <span>Durée: {selectedMovieForDetails.duration}</span>
                      <span>•</span>
                      <span>Format: {selectedMovieForDetails.version}</span>
                    </div>

                    <p className="text-zinc-300 text-xs mt-4 leading-relaxed bg-zinc-900 p-3 rounded-lg border border-zinc-850">
                      {selectedMovieForDetails.synopsis}
                    </p>
                  </div>

                  {/* Sessions linked to this movie */}
                  <div className="mt-6">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Projections associées</span>
                    <div className="flex flex-wrap gap-2">
                      {showtimes.filter(st => st.movieId === selectedMovieForDetails.id).map(st => (
                        <button
                          key={st.id}
                          id={`detail-select-showtime-${st.id}`}
                          onClick={() => {
                            setSelectedShowtimeForBooking(st);
                            setSelectedMovieForDetails(null);
                          }}
                          className="bg-zinc-900 hover:bg-orange-500 hover:text-black border border-zinc-800 text-white font-mono text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                        >
                          {st.day === 'today' ? "Auj." : st.day === 'tomorrow' ? "Dem." : st.day} • {st.time} ({st.price.toLocaleString()} XAF)
                        </button>
                      ))}

                      {showtimes.filter(st => st.movieId === selectedMovieForDetails.id).length === 0 && (
                        <span className="text-zinc-500 text-xs font-mono">Aucune projection planifiée pour le moment.</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </AnimatePresence>

      {/* Client Chat SMS Widget overlay */}
      <ChatWidget 
        currentUser={currentUser}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

    </div>
  );
}

