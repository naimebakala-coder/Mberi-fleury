/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Star, User as UserIcon, LogOut, Film, Menu, X, ShieldAlert, Award } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Header({
  currentUser,
  onOpenAuth,
  onLogout,
  onSearch,
  activeSection,
  setActiveSection
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'films', label: 'Films & Séries' },
    { id: 'secondary', label: 'Présentation & Photos' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-zinc-800 px-4 md:px-8 py-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          onClick={() => { setActiveSection('home'); setIsMobileMenuOpen(false); }} 
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="header-logo"
        >
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full drop-shadow-[0_4px_6px_rgba(242,169,0,0.15)]"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Roof Left Slope (Lighter Yellow) */}
              <path 
                d="M 32.5 36.25 L 17.5 58.75 L 52.5 76.25 L 67.5 53.75 Z" 
                fill="#fde047" 
              />
              
              {/* Roof Right Slope (Medium Yellow) */}
              <path 
                d="M 32.5 36.25 L 67.5 53.75 L 82.5 61.25 L 47.5 43.75 Z" 
                fill="#fbbf24" 
              />
              
              {/* Gable Left Face (Main Golden Yellow) */}
              <path 
                d="M 17.5 58.75 L 32.5 36.25 L 47.5 43.75 L 47.5 78.75 L 17.5 93.75 Z" 
                fill="#f2a900" 
              />
              
              {/* Side Right Wall (Shadow Orange/Gold) */}
              <path 
                d="M 47.5 43.75 L 82.5 61.25 L 82.5 96.25 L 47.5 78.75 Z" 
                fill="#ca8a04" 
              />
              
              {/* Movie Camera Projector on Gable Wall (White) */}
              {/* Camera Body */}
              <path 
                d="M 36 62 L 26 67 L 26 75 L 36 70 Z" 
                fill="white" 
                fillOpacity="0.95" 
              />
              
              {/* Camera Lens */}
              <path 
                d="M 26 70 L 21 67 L 21 78 L 26 74 Z" 
                fill="white" 
                fillOpacity="0.95" 
              />
              
              {/* Camera Reels */}
              <ellipse 
                cx="29" 
                cy="62.5" 
                rx="2.8" 
                ry="1.8" 
                transform="rotate(-26.5 29 62.5)" 
                fill="white" 
                fillOpacity="0.95" 
              />
              <ellipse 
                cx="33.5" 
                cy="60.5" 
                rx="2.8" 
                ry="1.8" 
                transform="rotate(-26.5 33.5 60.5)" 
                fill="white" 
                fillOpacity="0.95" 
              />
            </svg>
          </div>
          <div className="flex items-baseline gap-1 font-sans">
            <span className="text-white text-2xl font-bold tracking-tight">ici</span>
            <span className="text-[#f2a900] text-2xl font-black tracking-tight">Ciné</span>
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`text-sm font-semibold tracking-wide uppercase transition-colors py-2 px-1 relative ${
                activeSection === item.id 
                  ? 'text-orange-500' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
          
          {currentUser?.role === 'admin' && (
            <button
              id="nav-item-admin"
              onClick={() => setActiveSection('admin')}
              className={`text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-full border ${
                activeSection === 'admin' 
                  ? 'bg-orange-950/40 border-orange-500 text-orange-500' 
                  : 'bg-zinc-900 border-zinc-800 text-red-400 hover:text-red-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </button>
          )}

          {currentUser?.role === 'client' && (
            <button
              id="nav-item-client-profile"
              onClick={() => setActiveSection('reservations')}
              className={`text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-full border ${
                activeSection === 'reservations' 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-orange-500" />
              Mes Réservations
            </button>
          )}
        </nav>

        {/* Right Actions Section */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Live Search Component */}
          <div className="relative flex items-center">
            {showSearchInput && (
              <input
                id="header-search-input"
                type="text"
                placeholder="Rechercher un film, un genre..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-zinc-900 text-white text-xs px-3 py-2 pr-8 rounded-md border border-zinc-800 focus:outline-none focus:border-orange-500 w-48 md:w-60 transition-all placeholder-zinc-500"
              />
            )}
            <button
              id="header-search-toggle"
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors ml-1"
              title="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Star PRO Indicator */}
          <button 
            id="header-pro-badge"
            className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold px-3 py-2 rounded-md flex items-center gap-1 transition-colors shadow-sm"
          >
            <Star className="w-3.5 h-3.5 fill-black" />
            <span>★ PRO</span>
          </button>

          {/* User Section / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 py-1.5 px-3.5 rounded-lg">
              <div className="flex flex-col text-right">
                <span className="text-white text-xs font-semibold max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                  {currentUser.role}
                </span>
              </div>
              <div className="w-7 h-7 bg-orange-500 text-black font-bold text-xs flex items-center justify-center rounded-full">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="text-zinc-400 hover:text-red-400 p-1.5 rounded-full hover:bg-zinc-850 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuth}
              className="text-xs uppercase font-bold tracking-wider text-white border border-orange-500 hover:bg-orange-500 hover:text-black transition-all px-4 py-2 rounded-md"
            >
              Connexion
            </button>
          )}

          {/* Language Selector */}
          <div className="text-xs text-zinc-400 font-bold border border-zinc-800 hover:border-zinc-750 px-2 py-1.5 rounded cursor-pointer transition-colors bg-zinc-900/40">
            FR ▾
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            id="mobile-search-toggle"
            onClick={() => { setShowSearchInput(!showSearchInput); setActiveSection('home'); }}
            className="p-1.5 text-zinc-400 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-zinc-300 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 bg-zinc-950 rounded-xl border border-zinc-800 p-4 flex flex-col gap-3 animate-fadeIn">
          {showSearchInput && (
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-zinc-900 text-white text-xs px-3 py-2.5 rounded-md border border-zinc-800 w-full focus:outline-none focus:border-orange-500"
            />
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`text-sm font-semibold tracking-wide uppercase py-2 text-left px-2 rounded-md ${
                activeSection === item.id 
                  ? 'bg-orange-950/30 text-orange-500 border-l-2 border-orange-500' 
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}

          {currentUser?.role === 'admin' && (
            <button
              id="mobile-nav-admin"
              onClick={() => {
                setActiveSection('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`text-sm font-bold tracking-wide uppercase py-2 text-left px-2 rounded-md text-red-400 flex items-center gap-2 ${
                activeSection === 'admin' ? 'bg-red-950/30 text-red-300' : 'hover:bg-zinc-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Tableau de bord Admin
            </button>
          )}

          {currentUser?.role === 'client' && (
            <button
              id="mobile-nav-reservations"
              onClick={() => {
                setActiveSection('reservations');
                setIsMobileMenuOpen(false);
              }}
              className={`text-sm font-bold tracking-wide uppercase py-2 text-left px-2 rounded-md text-orange-500 flex items-center gap-2 ${
                activeSection === 'reservations' ? 'bg-orange-500/10' : 'hover:bg-zinc-900'
              }`}
            >
              <Award className="w-4 h-4" />
              Mes Réservations
            </button>
          )}

          <div className="h-px bg-zinc-800 my-1" />

          {/* User Auth Section Mobile */}
          {currentUser ? (
            <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 text-black font-bold text-xs flex items-center justify-center rounded-full">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-semibold truncate max-w-[150px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                id="mobile-logout-btn"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 hover:bg-red-950/40 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              id="mobile-login-btn"
              onClick={() => {
                onOpenAuth();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-center text-xs uppercase font-bold tracking-wider text-black bg-orange-500 hover:bg-orange-600 transition-colors py-2.5 rounded-md shadow"
            >
              Connexion
            </button>
          )}
        </div>
      )}
    </header>
  );
}
