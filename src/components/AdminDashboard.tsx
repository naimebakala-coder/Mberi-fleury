/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Movie, Showtime, TicketPrice, Booking, ChatMessage } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Film, Ticket, Settings, Plus, Trash2, Edit2, ShieldCheck, 
  DollarSign, Percent, Calendar, Heart, Eye, ListFilter, RefreshCw,
  UploadCloud, Link, MessageSquare, Send, Smartphone, CheckCheck, User
} from 'lucide-react';

interface AdminDashboardProps {
  movies: Movie[];
  showtimes: Showtime[];
  prices: TicketPrice[];
  bookings: Booking[];
  messages: ChatMessage[];
  onAddMovie: (movie: Omit<Movie, 'id'>) => void;
  onRemoveMovie: (movieId: string) => void;
  onUpdatePrice: (priceId: string, newPrice: number) => void;
  onSendReply: (threadId: string, text: string) => void;
}

export default function AdminDashboard({
  movies,
  showtimes,
  prices,
  bookings,
  messages,
  onAddMovie,
  onRemoveMovie,
  onUpdatePrice,
  onSendReply
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'catalog' | 'prices' | 'bookings' | 'chats'>('stats');

  
  // Movie creation states
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newType, setNewType] = useState<'film' | 'serie' | 'dessin'>('film');
  const [newDuration, setNewDuration] = useState('1h45');
  const [newVersion, setNewVersion] = useState('VF');
  const [newPoster, setNewPoster] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Chat center states
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const adminChatEndRef = useRef<HTMLDivElement>(null);


  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewPoster(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculations for stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.seats.length, 0);

  // Chat Calculations & Hooks
  const adminUnreadCount = messages.filter(m => m.senderRole !== 'admin' && !m.readByAdmin).length;

  // Mark active thread as read
  useEffect(() => {
    if (activeTab === 'chats' && selectedThreadId) {
      messages.forEach(m => {
        if (m.threadId === selectedThreadId && m.senderRole !== 'admin' && !m.readByAdmin) {
          m.readByAdmin = true;
        }
      });
      localStorage.setItem('cpn_bookings_read_sync', Date.now().toString());
    }
  }, [selectedThreadId, messages, activeTab]);

  // Auto scroll admin chat
  useEffect(() => {
    if (activeTab === 'chats' && selectedThreadId) {
      setTimeout(() => {
        adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [selectedThreadId, messages.length, activeTab]);

  
  // Calculate average occupancy
  const totalCapacityAvailable = showtimes.length * 64; // 64 seats per showtime
  const totalSeatsBooked = showtimes.reduce((sum, s) => sum + s.bookedSeats.length, 0);
  const occupancyRate = totalCapacityAvailable > 0 
    ? Math.round((totalSeatsBooked / totalCapacityAvailable) * 100) 
    : 0;

  // Chart Data: Revenue by Movie
  const revenueByMovieData = movies.map(movie => {
    const movieBookings = bookings.filter(b => b.movieId === movie.id);
    const revenue = movieBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const tickets = movieBookings.reduce((sum, b) => sum + b.seats.length, 0);
    return {
      name: movie.title.length > 15 ? movie.title.slice(0, 15) + '...' : movie.title,
      'Revenu (FCFA)': revenue,
      'Billets': tickets
    };
  }).filter(d => d['Revenu (FCFA)'] > 0);

  // Chart Data: Tickets sold by Category
  const ticketsByCategoryData = prices.filter(p => p.category !== 'glasses').map(price => {
    const categoryBookings = bookings.filter(b => b.category === price.category);
    const count = categoryBookings.reduce((sum, b) => sum + b.seats.length, 0);
    return {
      name: price.label.replace('Tarif ', ''),
      value: count
    };
  }).filter(d => d.value > 0);

  const COLORS = ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'];

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newGenre) {
      alert("Veuillez renseigner au moins le titre et le genre !");
      return;
    }

    // Default high quality poster fallback if empty
    const posterUrl = newPoster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600';

    onAddMovie({
      title: newTitle,
      genre: newGenre,
      type: newType,
      duration: newDuration,
      version: newVersion,
      poster: posterUrl,
      synopsis: newSynopsis || "Aucun synopsis disponible."
    });

    setSuccessMsg(`"${newTitle}" a été publié avec succès à l'affiche !`);
    
    // Reset form
    setNewTitle('');
    setNewGenre('');
    setNewPoster('');
    setNewSynopsis('');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 md:p-8 text-white max-w-7xl mx-auto shadow-2xl mt-4">
      {/* Dashboard Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-orange-500 text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Espace d'Administration du Cinéma
          </div>
          <h2 className="text-2xl font-black tracking-tight">Tableau de Bord Directeur</h2>
        </div>
        
        {/* Navigation Admin Tabs */}
        <div className="flex flex-wrap gap-2 bg-zinc-950 p-1.5 border border-zinc-800/60 rounded-xl">
          <button
            id="admin-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stats' 
                ? 'bg-orange-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Ventes & Stats
          </button>
          <button
            id="admin-tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog' 
                ? 'bg-orange-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Gestion des Affiches
          </button>
          <button
            id="admin-tab-prices"
            onClick={() => setActiveTab('prices')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'prices' 
                ? 'bg-orange-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Configuration des Tarifs
          </button>
          <button
            id="admin-tab-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookings' 
                ? 'bg-orange-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            Réservations ({bookings.length})
          </button>
          <button
            id="admin-tab-chats"
            onClick={() => setActiveTab('chats')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'chats' 
                ? 'bg-orange-500 text-black shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Messagerie SMS
            {adminUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold py-0.5 px-1.5 rounded-full animate-pulse ml-1">
                {adminUnreadCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="flex flex-col gap-8 animate-fadeIn" id="admin-stats-panel">
          
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Chiffre d'Affaires</span>
                <span className="text-orange-500 text-2xl font-mono font-black mt-1 block">
                  {totalRevenue.toLocaleString()} <span className="text-sm font-sans font-bold">XAF</span>
                </span>
                <span className="text-emerald-400 text-[10px] font-mono mt-1 block">★ Cumul des réservations</span>
              </div>
              <div className="bg-orange-500/10 p-3.5 rounded-xl text-orange-500">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Billets Vendus</span>
                <span className="text-white text-2xl font-mono font-black mt-1 block">
                  {totalTicketsSold} <span className="text-sm font-sans font-bold">PLACES</span>
                </span>
                <span className="text-zinc-400 text-[10px] block mt-1">Sur l'ensemble des projections</span>
              </div>
              <div className="bg-orange-950/20 p-3.5 rounded-xl text-orange-500">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Taux d'Occupation</span>
                <span className="text-white text-2xl font-mono font-black mt-1 block">
                  {occupancyRate}%
                </span>
                <span className="text-orange-500 text-[10px] block mt-1">Sièges réservés vs Capacité totale</span>
              </div>
              <div className="bg-zinc-900 p-3.5 rounded-xl text-orange-500">
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphics Section using recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Revenue by Movie */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Revenus Générés par Film (XAF)
              </h3>
              <div className="h-72 w-full">
                {revenueByMovieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByMovieData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1d1d1d" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090909', borderColor: '#262626', color: '#fff', fontSize: '11px' }} 
                        itemStyle={{ color: '#f97316' }}
                      />
                      <Bar dataKey="Revenu (FCFA)" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                    Aucune statistique disponible pour l'instant
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart: Tickets Sold by Category */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-orange-500" />
                Répartition des Ventes par Catégorie
              </h3>
              <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
                {ticketsByCategoryData.length > 0 ? (
                  <>
                    <div className="h-56 w-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ticketsByCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {ticketsByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#090909', borderColor: '#262626', color: '#fff', fontSize: '11px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Custom Legend */}
                    <div className="flex flex-col gap-2">
                      {ticketsByCategoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="text-neutral-400">{entry.name}:</span>
                          <span className="font-bold font-mono text-white">{entry.value} billets</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                    Aucun billet réservé pour l'instant
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Session Status Summary */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Suivi Temps Réel de Taux de Remplissage des Séances
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="py-3 px-4">Film & Session</th>
                    <th className="py-3 px-4">Jour</th>
                    <th className="py-3 px-4 text-center">Places Occupées</th>
                    <th className="py-3 px-4 text-center">Taux</th>
                    <th className="py-3 px-4">Progression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {showtimes.map(st => {
                    const pct = Math.round((st.bookedSeats.length / st.capacity) * 100);
                    return (
                      <tr key={st.id} className="hover:bg-zinc-900/30">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {st.movieTitle} <span className="text-orange-500 font-mono font-medium ml-2">[{st.time}]</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 capitalize">
                          {st.day === 'today' ? "Aujourd'hui" : st.day === 'tomorrow' ? "Demain" : st.day}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {st.bookedSeats.length} / {st.capacity}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-orange-400">
                          {pct}%
                        </td>
                        <td className="py-3.5 px-4 w-40">
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATALOG MANAGEMENT TAB */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn" id="admin-catalog-panel">
          
          {/* Left: Add New Media Poster Form */}
          <div className="w-full lg:w-96 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4 pb-2 border-b border-zinc-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Publier un Nouveau Film
            </h3>

            {successMsg && (
              <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-200 text-xs font-bold py-2.5 px-3 rounded-lg text-center mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateMovie} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Titre de l'œuvre</label>
                <input
                  id="admin-new-title"
                  type="text"
                  placeholder="e.g. Des Minions..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-zinc-900 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Catégorie / Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['film', 'serie', 'dessin'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`py-2 px-1 rounded-lg font-bold border capitalize transition-colors ${
                        newType === type 
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {type === 'dessin' ? 'Dessin Animé' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Genre(s)</label>
                <input
                  id="admin-new-genre"
                  type="text"
                  placeholder="e.g. Animation, Comédie"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="bg-zinc-900 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Durée</label>
                  <input
                    id="admin-new-duration"
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="bg-zinc-900 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider">Version</label>
                  <input
                    id="admin-new-version"
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="bg-zinc-900 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Affiche du Film</label>
                
                {newPoster ? (
                  <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 flex items-center gap-3">
                    <img 
                      src={newPoster} 
                      alt="Affiche prévisualisation" 
                      className="w-12 h-16 object-cover rounded bg-zinc-950 border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-emerald-400 text-[10px] font-bold uppercase block">Affiche chargée</span>
                      <p className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
                        {newPoster.startsWith('data:') ? 'Fichier local chargé' : newPoster}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewPoster('')}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                      title="Retirer l'affiche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('poster-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <input 
                      id="poster-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className="w-6 h-6 text-zinc-500 hover:text-orange-500 transition-colors" />
                    <div className="text-[11px] text-zinc-300 font-medium">
                      Glissez l'affiche ici, ou <span className="text-orange-500 underline font-bold">parcourez</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">PNG, JPG, JPEG ou WEBP</span>
                  </div>
                )}

                {/* Option to enter URL instead */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Saisissez l'URL complète de l'affiche (commençant par http:// ou https://) :");
                      if (url) {
                        setNewPoster(url);
                      }
                    }}
                    className="text-[10px] text-zinc-500 hover:text-orange-500 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Link className="w-3 h-3" />
                    Ou utiliser une URL d'image externe
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider">Synopsis</label>
                <textarea
                  id="admin-new-synopsis"
                  placeholder="Brève description de l'histoire du film..."
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  rows={3}
                  className="bg-zinc-900 text-white p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <button
                id="admin-publish-movie-btn"
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-3 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/5 flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                Publier à l'Affiche
              </button>
            </form>
          </div>

          {/* Right: Existing Media List & Deletion */}
          <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h3 className="text-white font-bold text-base mb-4 pb-2 border-b border-zinc-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Film className="w-5 h-5 text-orange-500" />
                Catalogue des Œuvres Actives ({movies.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Zone de suppression</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-1">
              {movies.map(movie => (
                <div 
                  key={movie.id}
                  className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex gap-3 items-center justify-between group hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-12 h-16 object-cover rounded-lg bg-zinc-950 border border-zinc-800 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-bold truncate">{movie.title}</h4>
                      <span className="text-orange-500 text-[9px] font-mono tracking-wider block uppercase mt-0.5">
                        {movie.type === 'dessin' ? 'Dessin Animé' : movie.type}
                      </span>
                      <p className="text-zinc-400 text-[10px] truncate mt-0.5">{movie.genre}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        {movie.duration} • {movie.version}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`remove-movie-${movie.id}`}
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir retirer le film "${movie.title}" de l'affiche ? Cela supprimera également les séances associées.`)) {
                        onRemoveMovie(movie.id);
                      }
                    }}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/80 rounded-lg transition-colors flex-shrink-0"
                    title="Retirer de l'affiche"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TICKET PRICING CONFIG TAB */}
      {activeTab === 'prices' && (
        <div className="max-w-3xl mx-auto bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 animate-fadeIn" id="admin-prices-panel">
          <h3 className="text-white font-bold text-base mb-6 pb-2 border-b border-zinc-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              Ajustement des Tarifs de Billetterie
            </span>
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Mise à jour en temps réel</span>
          </h3>

          <div className="flex flex-col gap-4">
            {prices.map(price => (
              <div 
                key={price.id}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-zinc-700"
              >
                <div>
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">{price.label}</h4>
                  <span className="text-zinc-400 text-[10px] font-mono mt-1 block uppercase">ID Catégorie: {price.category}</span>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 w-32 justify-end">
                    <input
                      id={`price-input-${price.id}`}
                      type="number"
                      step={100}
                      value={price.price}
                      onChange={(e) => onUpdatePrice(price.id, Number(e.target.value))}
                      className="bg-transparent text-white text-right text-xs font-mono font-bold w-full focus:outline-none"
                    />
                    <span className="text-zinc-500 text-[10px] font-bold font-mono">FCFA</span>
                  </div>
                  
                  <button
                    id={`price-quick-add-${price.id}`}
                    onClick={() => onUpdatePrice(price.id, price.price + 500)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-orange-500 text-[10px] font-mono font-bold px-2 py-1.5 rounded border border-zinc-800 transition-colors"
                  >
                    +500
                  </button>
                  <button
                    id={`price-quick-sub-${price.id}`}
                    onClick={() => onUpdatePrice(price.id, Math.max(0, price.price - 500))}
                    className="bg-zinc-950 hover:bg-zinc-800 text-orange-500 text-[10px] font-mono font-bold px-2 py-1.5 rounded border border-zinc-800 transition-colors"
                  >
                    -500
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-950/20 border border-orange-900/40 rounded-xl p-4 mt-6 text-xs text-zinc-300 leading-relaxed">
            <strong>Note de Gestion :</strong> Ces tarifs s'appliquent immédiatement à toutes les nouvelles réservations effectuées par les visiteurs sur le site de Culture Parc Ndjindji. Les tarifs d'enfants (3 à 11 ans) et d'étudiants requièrent la présentation d'un justificatif correspondant à l'entrée de la salle de cinéma.
          </div>
        </div>
      )}

      {/* REAL-TIME RESERVATIONS LOG LIST */}
      {activeTab === 'bookings' && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 animate-fadeIn" id="admin-bookings-panel">
          <h3 className="text-white font-bold text-base mb-4 pb-2 border-b border-zinc-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              Historique des Transactions de Billetterie
            </span>
            <span className="bg-orange-950/40 text-orange-500 text-[10px] font-mono py-1 px-2.5 rounded-full border border-orange-900/50 uppercase">
              {bookings.length} ventes enregistrées
            </span>
          </h3>

          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Film & Projection</th>
                    <th className="py-3 px-4 text-center">Sièges</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-zinc-300">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-500">
                        #{b.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{b.userName}</span>
                          <span className="text-[10px] text-zinc-500">{b.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{b.movieTitle}</span>
                          <span className="text-[10px] text-orange-500 font-mono">{b.day} • {b.time}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-wrap justify-center gap-1 max-w-[120px] mx-auto">
                          {b.seats.map(s => (
                            <span key={s} className="bg-zinc-900 border border-zinc-800 text-orange-500 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-orange-500">
                        {b.totalPrice.toLocaleString()} FCFA
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-500 text-[10px] font-mono">
                        {new Date(b.createdAt).toLocaleDateString('fr-FR')} {new Date(b.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-500 font-mono">
              Aucune vente n'a encore été effectuée sur l'application.
            </div>
          )}
        </div>
      )}

      {/* MESSAGING CENTER / SMS TAB */}
      {activeTab === 'chats' && (() => {
        // Group messages into threads
        const threads = Array.from(new Set(messages.map(m => m.threadId))).map(tId => {
          const threadMsgs = messages.filter(m => m.threadId === tId);
          const sortedMsgs = [...threadMsgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          const lastMsg = sortedMsgs[sortedMsgs.length - 1];
          
          const clientMsg = sortedMsgs.find(m => m.senderRole !== 'admin');
          const clientName = clientMsg ? clientMsg.senderName : 'Visiteur Anonyme';
          const clientPhone = clientMsg ? clientMsg.phoneNumber : '';
          const clientEmail = clientMsg ? clientMsg.email : '';
          const unreadForAdmin = sortedMsgs.filter(m => m.senderRole !== 'admin' && !m.readByAdmin).length;

          return {
            threadId: tId,
            clientName,
            clientPhone,
            clientEmail,
            lastMsg,
            messages: sortedMsgs,
            unreadCount: unreadForAdmin,
          };
        }).sort((a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime());

        // Automatically select first thread if none is selected
        if (!selectedThreadId && threads.length > 0) {
          setSelectedThreadId(threads[0].threadId);
        }

        const activeThread = threads.find(t => t.threadId === selectedThreadId);

        const handleSendReplySubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!replyText.trim() || !selectedThreadId) return;
          onSendReply(selectedThreadId, replyText);
          setReplyText('');
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden min-h-[550px] animate-fadeIn" id="admin-chats-panel">
            {/* Thread List Sidebar (4 Cols) */}
            <div className="lg:col-span-4 border-r border-zinc-900 flex flex-col h-full min-h-[550px]">
              <div className="p-4 border-b border-zinc-900 bg-zinc-900/40 flex justify-between items-center">
                <h4 className="text-white font-extrabold text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  Boîte de Réception
                </h4>
                <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-mono py-0.5 px-2 rounded-md font-bold uppercase">
                  {threads.length} {threads.length > 1 ? 'fils' : 'fil'}
                </span>
              </div>

              {/* Sidebar list */}
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60 max-h-[480px]">
                {threads.length === 0 ? (
                  <div className="py-20 text-center text-xs text-zinc-500 font-mono flex flex-col items-center justify-center p-6 gap-2">
                    <MessageSquare className="w-8 h-8 text-zinc-700" />
                    <span>Aucun message reçu pour le moment.</span>
                  </div>
                ) : (
                  threads.map(thread => {
                    const isSelected = thread.threadId === selectedThreadId;
                    return (
                      <button
                        key={thread.threadId}
                        onClick={() => setSelectedThreadId(thread.threadId)}
                        className={`w-full text-left p-4 transition-all flex items-start gap-3 hover:bg-zinc-900/45 cursor-pointer ${
                          isSelected ? 'bg-zinc-900 border-l-2 border-orange-500' : ''
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-orange-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {thread.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-1">
                            <h5 className="font-bold text-white text-xs truncate">{thread.clientName}</h5>
                            <span className="text-[9px] text-zinc-500 font-mono flex-shrink-0">
                              {new Date(thread.lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className="text-[9px] text-orange-500/80 font-mono block truncate mt-0.5">
                            {thread.clientPhone || 'Pas de numéro'}
                          </span>

                          <p className={`text-[11px] mt-1.5 truncate ${
                            thread.unreadCount > 0 ? 'text-zinc-100 font-semibold' : 'text-zinc-400'
                          }`}>
                            {thread.lastMsg.text}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation Window (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[550px] bg-gradient-to-b from-zinc-950 to-zinc-900/60">
              {activeThread ? (
                <div className="flex flex-col h-full flex-1">
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-zinc-900 bg-zinc-900/40 flex justify-between items-center">
                    <div className="text-left">
                      <h4 className="text-white font-extrabold text-sm">{activeThread.clientName}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[10px]">
                        {activeThread.clientPhone && (
                          <span className="text-orange-500 font-bold">📞 {activeThread.clientPhone}</span>
                        )}
                        {activeThread.clientEmail && (
                          <span className="text-zinc-400">✉ {activeThread.clientEmail}</span>
                        )}
                        <span className="text-zinc-500 uppercase">
                          • {activeThread.threadId.startsWith('guest-') ? 'Visiteur' : 'Client Inscrit'}
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 text-[10px] font-mono py-1 px-2.5 rounded-lg font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Canal Direct SMS
                    </span>
                  </div>

                  {/* Message History list */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px] min-h-[300px]">
                    {activeThread.messages.map((msg) => {
                      const isAdmin = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[75%] ${
                            isAdmin ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'
                          }`}
                        >
                          <span className="text-[9px] text-zinc-500 font-mono mb-1">
                            {isAdmin ? 'Vous (Direction)' : activeThread.clientName}
                          </span>
                          
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isAdmin 
                              ? 'bg-orange-500 text-black font-medium rounded-tr-none' 
                              : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'
                          }`}>
                            {msg.text}
                          </div>

                          <div className="flex items-center gap-1 mt-1 font-mono text-[8px] text-zinc-500">
                            <span>
                              {new Date(msg.timestamp).toLocaleDateString('fr-FR')} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isAdmin && (
                              <span>
                                {msg.readByClient ? (
                                  <CheckCheck className="w-3 h-3 text-sky-400" />
                                ) : (
                                  <CheckCheck className="w-3 h-3 text-zinc-600" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={adminChatEndRef} />
                  </div>

                  {/* Message Input Footer Form */}
                  <form onSubmit={handleSendReplySubmit} className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex gap-2">
                    <input
                      type="text"
                      placeholder={`Répondre par SMS à ${activeThread.clientName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      Répondre
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <MessageSquare className="w-7 h-7 text-orange-500/60" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Messagerie SMS d'Ici Ciné</h4>
                    <p className="text-zinc-500 text-xs mt-1 max-w-[280px] leading-relaxed">
                      Sélectionnez une discussion à gauche pour consulter les messages des clients et leur envoyer une réponse instantanée.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
