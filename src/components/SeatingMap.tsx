/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Showtime, Movie, TicketPrice, User } from '../types';
import { Armchair, CreditCard, Ticket, X, Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface SeatingMapProps {
  showtime: Showtime;
  movie: Movie;
  prices: TicketPrice[];
  currentUser: User | null;
  onClose: () => void;
  onBookSeats: (showtimeId: string, seats: string[], category: string, totalPrice: number) => void;
  onOpenAuth: () => void;
}

export default function SeatingMap({
  showtime,
  movie,
  prices,
  currentUser,
  onClose,
  onBookSeats,
  onOpenAuth
}: SeatingMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketCategory, setTicketCategory] = useState<string>('standard');
  const [use3dGlasses, setUse3dGlasses] = useState(false);

  // Generate an 8x8 grid (64 seats): Rows A-H, Columns 1-8
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const getPriceByCategory = (cat: string): number => {
    const priceObj = prices.find(p => p.category === cat);
    return priceObj ? priceObj.price : 2500;
  };

  const getGlassesPrice = (): number => {
    const glassesObj = prices.find(p => p.category === 'glasses');
    return glassesObj ? glassesObj.price : 1500;
  };

  const singleSeatPrice = getPriceByCategory(ticketCategory);
  const glassesCost = use3dGlasses ? getGlassesPrice() : 0;
  const totalPrice = selectedSeats.length * (singleSeatPrice + glassesCost);

  const handleSeatClick = (seatId: string) => {
    if (showtime.bookedSeats.includes(seatId)) {
      return; // Already booked
    }
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmReservation = () => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour réserver des places !");
      onOpenAuth();
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Veuillez sélectionner au moins un siège !");
      return;
    }
    onBookSeats(showtime.id, selectedSeats, ticketCategory, totalPrice);
    setSelectedSeats([]);
  };

  const getFrenchDayLabel = (day: string) => {
    switch(day) {
      case 'today': return "Aujourd'hui";
      case 'tomorrow': return "Demain";
      case 'sunday': return "Ce Dimanche";
      case 'monday': return "Ce Lundi";
      default: return day;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div 
        id="seating-modal-container"
        className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        
        {/* Left Side: Seat Picker Grid */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-orange-500 text-xs font-mono tracking-wider uppercase font-bold">Sélection des Places</span>
              <h3 className="text-white text-lg font-bold">{movie.title}</h3>
            </div>
            <button 
              id="close-seating-modal"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Screen projection design */}
          <div className="w-full max-w-md mx-auto mb-10 text-center relative">
            <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase tracking-widest">ÉCRAN DU CINÉMA / SCREEN</div>
            <div className="h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full shadow-lg shadow-orange-500/20" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-gradient-to-b from-orange-500/5 to-transparent blur-md pointer-events-none" />
          </div>

          {/* Interactive Seating Layout */}
          <div className="grid gap-3 mb-8 w-full max-w-lg overflow-x-auto p-2 select-none" id="seating-layout-grid">
            {rows.map(row => (
              <div key={row} className="flex items-center justify-center gap-3">
                {/* Row label left */}
                <span className="w-4 text-xs font-bold text-zinc-600 font-mono text-center">{row}</span>
                
                {/* Seats list */}
                <div className="flex gap-2.5">
                  {cols.map(col => {
                    const seatId = `${row}${col}`;
                    const isBooked = showtime.bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    let seatColorClass = "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700";
                    if (isBooked) {
                      seatColorClass = "bg-zinc-950 border border-zinc-900/50 text-zinc-700 cursor-not-allowed";
                    } else if (isSelected) {
                      seatColorClass = "bg-orange-500 text-black border border-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-600";
                    }

                    return (
                      <button
                        key={seatId}
                        id={`seat-btn-${seatId}`}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={isBooked}
                        className={`w-8 h-8 rounded-md text-[10px] font-bold font-mono transition-all flex items-center justify-center relative ${seatColorClass}`}
                        title={isBooked ? `Siège ${seatId} réservé` : `Choisir le siège ${seatId}`}
                      >
                        {isBooked ? (
                          <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                        ) : (
                          seatId
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-4 text-xs font-bold text-zinc-600 font-mono text-center">{row}</span>
              </div>
            ))}
          </div>

          {/* Seating Legend */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-400 mt-2 bg-zinc-900/40 px-4 py-3 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-zinc-900 border border-zinc-800 rounded-sm" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-orange-500 rounded-sm" />
              <span>Sélectionné</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-900 rounded-sm flex items-center justify-center">
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
              </span>
              <span>Réservé</span>
            </div>
          </div>
        </div>

        {/* Right Side: Pricing & Reservation Cart Details */}
        <div className="w-full md:w-80 bg-[#0f0f0f] border-t md:border-t-0 md:border-l border-zinc-800 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-base mb-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              Résumé du Panier
            </h4>

            {/* Movie Info Card */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 mb-4 text-xs flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cinéma :</span>
                <span className="text-white font-semibold">Culture Parc Ndjindji</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Heure :</span>
                <span className="text-white font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" /> {showtime.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Jour de projection :</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-500" /> {getFrenchDayLabel(showtime.day)}
                </span>
              </div>
            </div>

            {/* Interactive Category Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Catégorie de Billet
              </label>
              <select
                id="ticket-category-select"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {prices.filter(p => p.category !== 'glasses').map(price => (
                  <option key={price.id} value={price.category}>
                    {price.label} ({price.price.toLocaleString()} XAF)
                  </option>
                ))}
              </select>
            </div>

            {/* Option for 3D Glasses */}
            <div className="mb-6 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  id="3d-glasses-checkbox"
                  type="checkbox"
                  checked={use3dGlasses}
                  onChange={(e) => setUse3dGlasses(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Lunettes 3D (+1 500 FCFA)
                  </span>
                  <span className="text-[10px] text-zinc-400">Optionnel pour films d'action ou 3D</span>
                </div>
              </label>
            </div>

            {/* Selected Seats Listing */}
            <div className="mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Sièges sélectionnés ({selectedSeats.length})
              </span>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {selectedSeats.map(seat => (
                    <span 
                      key={seat} 
                      className="bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-mono font-bold py-1 px-2.5 rounded flex items-center gap-1"
                    >
                      {seat}
                      <button 
                        onClick={() => handleSeatClick(seat)} 
                        className="hover:text-white font-sans text-[10px] ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-500 text-xs py-2">
                  <AlertCircle className="w-4 h-4 text-zinc-600" />
                  <span>Aucun siège choisi pour le moment</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Reservation Trigger button */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Total à payer</span>
                <span className="text-orange-500 text-xl font-black font-mono tracking-tight">
                  {totalPrice.toLocaleString()} <span className="text-xs">FCFA</span>
                </span>
              </div>
              <div className="text-right text-[10px] text-zinc-500 font-mono">
                {selectedSeats.length} × { (singleSeatPrice + glassesCost).toLocaleString() } XAF
              </div>
            </div>

            {currentUser ? (
              <button
                id="book-seats-confirm-btn"
                onClick={handleConfirmReservation}
                disabled={selectedSeats.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  selectedSeats.length > 0
                    ? 'bg-orange-500 text-black hover:bg-orange-600 shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Confirmer la Réservation
              </button>
            ) : (
              <button
                id="book-seats-auth-btn"
                onClick={onOpenAuth}
                className="w-full py-3 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                Se connecter pour réserver
              </button>
            )}
            
            <p className="text-[9px] text-zinc-500 text-center mt-3 leading-relaxed">
              *Réservation sécurisée en temps réel. Les places vous sont garanties dès validation. Billet électronique envoyé.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
