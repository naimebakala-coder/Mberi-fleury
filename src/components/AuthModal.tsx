/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, UserPlus, X, Shield, Users, Mail, Lock, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError("L'adresse email est requise.");
      return;
    }

    if (activeTab === 'login') {
      // Seed account checks
      if (email.toLowerCase() === 'admin@icicine.cg') {
        onLogin({
          id: 'u1',
          email: 'admin@icicine.cg',
          name: 'Administrateur',
          role: 'admin',
          favorites: []
        });
        onClose();
        return;
      }
      if (email.toLowerCase() === 'client@icicine.cg') {
        onLogin({
          id: 'u2',
          email: 'client@icicine.cg',
          name: 'Aimé Bakala',
          role: 'client',
          favorites: ['m7', 'm8']
        });
        onClose();
        return;
      }

      // Default client login for others
      const formattedName = email.split('@')[0];
      const capitalizedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
      onLogin({
        id: 'u_temp_' + Date.now(),
        email: email,
        name: capitalizedName || 'Visiteur',
        role: 'client',
        favorites: []
      });
      onClose();
    } else {
      // Register
      if (!name) {
        setError("Le nom complet est requis.");
        return;
      }
      onLogin({
        id: 'u_' + Date.now(),
        email: email,
        name: name,
        role: role,
        favorites: []
      });
      onClose();
    }
  };

  const handleQuickLogin = (type: 'admin' | 'client') => {
    if (type === 'admin') {
      onLogin({
        id: 'u1',
        email: 'admin@icicine.cg',
        name: 'Administrateur',
        role: 'admin',
        favorites: []
      });
    } else {
      onLogin({
        id: 'u2',
        email: 'client@icicine.cg',
        name: 'Aimé Bakala',
        role: 'client',
        favorites: ['m7', 'm8']
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        id="auth-modal-container"
        className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative flex flex-col gap-6"
      >
        {/* Close Button */}
        <button 
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="bg-orange-500 text-black w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-white text-lg font-bold">Portail d'Authentification</h3>
          <p className="text-xs text-zinc-400 mt-1">Cinéma Culture Parc Ndjindji</p>
        </div>

        {/* Custom tabs */}
        <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
          <button
            id="auth-tab-login"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'login'
                ? 'bg-orange-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Connexion
          </button>
          <button
            id="auth-tab-register"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'register'
                ? 'bg-orange-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Inscription
          </button>
        </div>

        {/* Quick evaluation buttons */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold text-center block mb-1">
            ⚡ Raccourcis de test rapide
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="quick-login-admin-btn"
              onClick={() => handleQuickLogin('admin')}
              className="bg-red-950/40 border border-red-900/50 text-red-300 hover:bg-red-900/30 text-[11px] py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Rôle Admin
            </button>
            <button
              id="quick-login-client-btn"
              onClick={() => handleQuickLogin('client')}
              className="bg-orange-950/40 border border-orange-900/50 text-orange-250 hover:bg-orange-900/30 text-[11px] py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Rôle Client
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-200 text-xs py-2.5 px-3 rounded-lg text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Nom complet
              </label>
              <div className="relative">
                <input
                  id="auth-register-name"
                  type="text"
                  placeholder="Aimé Bakala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-lg border border-zinc-800 w-full focus:outline-none focus:border-orange-500"
                  required
                />
                <Users className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Adresse Email
            </label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                placeholder={activeTab === 'login' ? 'admin@icicine.cg ou client@icicine.cg' : 'nom@exemple.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-lg border border-zinc-800 w-full focus:outline-none focus:border-orange-500"
                required
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-lg border border-zinc-800 w-full focus:outline-none focus:border-orange-500"
                required
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Rôle à assigner
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="role-select-client"
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    role === 'client'
                      ? 'bg-orange-950/20 border-orange-500 text-orange-500'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Client
                </button>
                <button
                  id="role-select-admin"
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    role === 'admin'
                      ? 'bg-red-950/20 border-red-500 text-red-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs py-3 rounded-lg uppercase tracking-wider transition-colors mt-2 shadow"
          >
            {activeTab === 'login' ? 'Se Connecter' : 'Créer un Compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
