/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string;
  type: 'film' | 'serie' | 'dessin';
  duration: string;
  version: string;
  synopsis: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  time: string; // e.g. "15h00"
  day: 'today' | 'tomorrow' | 'sunday' | 'monday';
  price: number;
  capacity: number;
  bookedSeats: string[]; // e.g. ["A3", "B4"]
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  favorites: string[]; // movie IDs
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  showtimeId: string;
  movieId: string;
  movieTitle: string;
  time: string;
  day: string;
  seats: string[];
  totalPrice: number;
  createdAt: string;
  category: string; // 'standard' | 'student' | 'child' | 'premiere'
}

export interface TicketPrice {
  id: string;
  category: string; // 'standard' | 'student' | 'child' | 'premiere' | 'glasses'
  label: string;
  price: number;
}

export interface WeeklyScheduleItem {
  id: string;
  movieTitle: string;
  duration: string;
  genre: string;
  version: string;
  // schedule by day: Tuesday to Sunday
  mardi?: string;
  mercredi?: string;
  jeudi?: string;
  vendredi?: string;
  samedi?: string;
  dimanche?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string; // Groups conversation for a specific client (logged-in or guest)
  senderId: string; // 'admin' or client's userId/guestId
  senderName: string;
  senderRole: 'admin' | 'client' | 'guest';
  text: string;
  timestamp: string;
  phoneNumber?: string;
  email?: string;
  readByAdmin: boolean;
  readByClient: boolean;
}

