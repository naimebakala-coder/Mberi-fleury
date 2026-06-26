/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Showtime, TicketPrice, WeeklyScheduleItem, Booking } from './types';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Michael',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    genre: 'Biographique, Musical',
    type: 'film',
    duration: '2h08',
    version: 'VF',
    synopsis: 'La vie et la carrière légendaires du roi de la pop, Michael Jackson, de ses débuts avec les Jackson 5 jusqu\'à ses triomphes mondiaux en solo.'
  },
  {
    id: 'm2',
    title: 'Passenger',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    genre: 'Horreur',
    type: 'film',
    duration: '1h34',
    version: 'VF',
    synopsis: 'Un voyageur solitaire se retrouve bloqué dans une station spatiale abandonnée, traqué par une entité cosmique invisible.'
  },
  {
    id: 'm3',
    title: 'Scary Movie 6',
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600',
    genre: 'Comédie horrifique',
    type: 'film',
    duration: '1h36',
    version: 'VF',
    synopsis: 'La célèbre franchise parodique est de retour pour tourner en dérision les derniers succès d\'horreur de la décennie dans une avalanche de gags déjantés.'
  },
  {
    id: 'm4',
    title: 'The Criminals',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    genre: 'Action, Policier',
    type: 'film',
    duration: '1h37',
    version: 'VF',
    synopsis: 'Deux inspecteurs chevronnés s\'engagent dans une course contre la montre à Pointe-Noire pour démanteler un réseau de contrebande international.'
  },
  {
    id: 'm5',
    title: 'Peppa au cinéma : La famille s\'agrandit !',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600', // We can use something cute or colorful
    genre: 'Animation',
    type: 'dessin',
    duration: '0h50',
    version: 'VF',
    synopsis: 'Rejoignez Peppa, George et leurs nouveaux amis pour une grande fête colorée sur écran géant avec des chansons inédites !'
  },
  {
    id: 'm6',
    title: 'La Bataille de Gaulle : L\'Âge de fer',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600',
    genre: 'Drame historique',
    type: 'film',
    duration: '2h40',
    version: 'VF',
    synopsis: 'Une fresque historique spectaculaire retraçant les moments de résistance et de stratégie cruciales de la France libre depuis l\'Afrique Équatoriale.'
  },
  {
    id: 'm7',
    title: 'Toy Story 5',
    poster: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=600',
    genre: 'Animation, Aventure',
    type: 'dessin',
    duration: '1h42',
    version: 'VF',
    synopsis: 'Woody, Buzz et toute la bande se lancent dans un nouveau voyage palpitant face à la domination des tablettes et des jouets connectés.'
  },
  {
    id: 'm8',
    title: 'Noise',
    poster: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600',
    genre: 'Horreur, Thriller',
    type: 'film',
    duration: '1h42',
    version: 'VF',
    synopsis: 'Un couple s\'installe dans une maison de campagne isolée et commence à percevoir de terrifiants murmures émanant du système de ventilation.'
  },
  {
    id: 'm9',
    title: 'Backrooms',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    genre: 'Horreur, Science-Fiction',
    type: 'film',
    duration: '1h45',
    version: 'VF',
    synopsis: 'Un groupe d\'explorateurs urbains glisse accidentellement à travers la réalité pour se retrouver piégé dans un labyrinthe infini de bureaux vides.'
  },
  {
    id: 'm10',
    title: 'Disclosure Day',
    poster: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=600',
    genre: 'Science-Fiction, Thriller',
    type: 'film',
    duration: '2h25',
    version: 'VF',
    synopsis: 'Le jour où tous les gouvernements de la Terre révèlent simultanément l\'existence de technologies extraterrestres cachées depuis un siècle.'
  },
  {
    id: 'm11',
    title: 'Who',
    poster: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    genre: 'Drame, Thriller',
    type: 'serie',
    duration: '2h10',
    version: 'VF',
    synopsis: 'Une enquête policière à rebondissements multiples où tout le monde ment pour couvrir un mystérieux vol au sein d\'une banque d\'affaires.'
  }
];

export const INITIAL_SHOWTIMES: Showtime[] = [
  // Aujourd'hui
  {
    id: 's1',
    movieId: 'm7',
    movieTitle: 'Toy Story 5',
    time: '15h00',
    day: 'today',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A3', 'A4', 'B5', 'C2', 'C3', 'D4', 'D5', 'E1', 'E2']
  },
  {
    id: 's2',
    movieId: 'm5',
    movieTitle: 'Peppa au cinéma : La famille s\'agrandit !',
    time: '17h20',
    day: 'today',
    price: 2500,
    capacity: 64,
    bookedSeats: ['B1', 'B2', 'B3', 'F4', 'F5', 'G2']
  },
  {
    id: 's3',
    movieId: 'm8',
    movieTitle: 'Noise',
    time: '19h30',
    day: 'today',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'A2', 'D1', 'D2', 'D3', 'H5', 'H6', 'H7', 'H8']
  },
  {
    id: 's4',
    movieId: 'm9',
    movieTitle: 'Backrooms',
    time: '21h40',
    day: 'today',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A5', 'A6', 'E6', 'E7', 'F1', 'F2', 'G7', 'G8']
  },

  // Demain
  {
    id: 's5',
    movieId: 'm1',
    movieTitle: 'Michael',
    time: '15h00',
    day: 'tomorrow',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'A2', 'A3', 'C4', 'C5', 'F5', 'F6']
  },
  {
    id: 's6',
    movieId: 'm4',
    movieTitle: 'The Criminals',
    time: '18h00',
    day: 'tomorrow',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'H4', 'H5', 'H6']
  },
  {
    id: 's7',
    movieId: 'm3',
    movieTitle: 'Scary Movie 6',
    time: '20h30',
    day: 'tomorrow',
    price: 2500,
    capacity: 64,
    bookedSeats: ['D4', 'D5', 'E4', 'E5']
  },

  // Dimanche
  {
    id: 's8',
    movieId: 'm5',
    movieTitle: 'Peppa au cinéma : La famille s\'agrandit !',
    time: '12h00',
    day: 'sunday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2']
  },
  {
    id: 's9',
    movieId: 'm7',
    movieTitle: 'Toy Story 5',
    time: '14h30',
    day: 'sunday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'G1', 'G2', 'H3']
  },
  {
    id: 's10',
    movieId: 'm6',
    movieTitle: 'La Bataille de Gaulle : L\'Âge de fer',
    time: '17h00',
    day: 'sunday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A3', 'A4', 'B3', 'B4', 'F5', 'F6', 'F7', 'G3', 'G4', 'G5', 'H4', 'H5']
  },
  {
    id: 's11',
    movieId: 'm2',
    movieTitle: 'Passenger',
    time: '20h00',
    day: 'sunday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['C1', 'C2', 'F2', 'F3', 'G4', 'G5']
  },

  // Lundi
  {
    id: 's12',
    movieId: 'm11',
    movieTitle: 'Who',
    time: '16h00',
    day: 'monday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'D4', 'D5']
  },
  {
    id: 's13',
    movieId: 'm10',
    movieTitle: 'Disclosure Day',
    time: '19h00',
    day: 'monday',
    price: 2500,
    capacity: 64,
    bookedSeats: ['A1', 'A2', 'B1', 'B2', 'G1', 'G2']
  }
];

export const INITIAL_PRICES: TicketPrice[] = [
  { id: 'p1', category: 'standard', label: 'Tarif standard / Nouveauté', price: 2500 },
  { id: 'p2', category: 'child', label: 'Tarif enfant (3 à 11 ans)', price: 1000 },
  { id: 'p3', category: 'student', label: 'Tarif étudiant', price: 1500 },
  { id: 'p4', category: 'premiere', label: 'Tarif Première', price: 5000 },
  { id: 'p5', category: 'glasses', label: 'Lunettes 3D', price: 1500 }
];

export const INITIAL_WEEKLY_SCHEDULE: WeeklyScheduleItem[] = [
  {
    id: 'w1',
    movieTitle: 'Noise',
    duration: '1h42',
    genre: 'Horreur, Thriller',
    version: 'VF',
    mardi: '15h00 (nouveau)',
    mercredi: '13h30 (nouveau)',
    jeudi: '14h10 (nouveau)',
    dimanche: '19h30'
  },
  {
    id: 'w2',
    movieTitle: 'Toy Story 5',
    duration: '1h42',
    genre: 'Animation, Aventure',
    version: 'VF',
    mercredi: '15h00',
    vendredi: '13h30',
    samedi: '14h10',
    dimanche: '14h30'
  },
  {
    id: 'w3',
    movieTitle: 'Backrooms',
    duration: '1h45',
    genre: 'Horreur, Science-Fiction',
    version: 'VF',
    mardi: '16h50',
    jeudi: '21h40',
    samedi: '19h00',
    dimanche: '21h40'
  },
  {
    id: 'w4',
    movieTitle: 'Who',
    duration: '2h10',
    genre: 'Drame, Thriller',
    version: 'VF',
    mardi: '14h00',
    jeudi: '16h50',
    vendredi: '19h40'
  },
  {
    id: 'w5',
    movieTitle: 'Disclosure Day',
    duration: '2h25',
    genre: 'Science-Fiction, Thriller',
    version: 'VF',
    mercredi: '19h50',
    vendredi: '18h10',
    samedi: '18h10'
  },
  {
    id: 'w6',
    movieTitle: 'The Criminals',
    duration: '1h37',
    genre: 'Action, Policier',
    version: 'VF',
    mercredi: '15h00',
    jeudi: '18h10',
    samedi: '12h00'
  },
  {
    id: 'w7',
    movieTitle: 'Michael',
    duration: '2h08',
    genre: 'Biographique, Musical',
    version: 'VF',
    mardi: '19h10',
    mercredi: '17h20',
    samedi: '21h00'
  },
  {
    id: 'w8',
    movieTitle: 'Passenger',
    duration: '1h34',
    genre: 'Horreur',
    version: 'VF',
    jeudi: '14h30',
    vendredi: '21h30',
    samedi: '16h40'
  },
  {
    id: 'w9',
    movieTitle: 'Peppa au cinéma : La famille s\'agrandit !',
    duration: '0h50',
    genre: 'Animation',
    version: 'VF',
    samedi: '10h00',
    dimanche: '12h00'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    userId: 'u2',
    userEmail: 'client@icicine.cg',
    userName: 'Aimé Bakala',
    showtimeId: 's1',
    movieId: 'm7',
    movieTitle: 'Toy Story 5',
    time: '15h00',
    day: 'Aujourd\'hui',
    seats: ['A3', 'A4'],
    totalPrice: 5000,
    createdAt: '2026-06-25T14:30:00Z',
    category: 'standard'
  },
  {
    id: 'b2',
    userId: 'u3',
    userEmail: 'etudiant@icicine.cg',
    userName: 'Sarah Mavoungou',
    showtimeId: 's3',
    movieId: 'm8',
    movieTitle: 'Noise',
    time: '19h30',
    day: 'Aujourd\'hui',
    seats: ['D1', 'D2', 'D3'],
    totalPrice: 4500, // 3 * 1500 (student)
    createdAt: '2026-06-25T18:15:00Z',
    category: 'student'
  },
  {
    id: 'b3',
    userId: 'u4',
    userEmail: 'famille@icicine.cg',
    userName: 'Famille Ngolo',
    showtimeId: 's8',
    movieId: 'm5',
    movieTitle: 'Peppa au cinéma : La famille s\'agrandit !',
    time: '12h00',
    day: 'Dimanche',
    seats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'],
    totalPrice: 10000, // 10 * 1000 (child)
    createdAt: '2026-06-24T10:20:00Z',
    category: 'child'
  }
];

export const INITIAL_CHATS = [
  {
    id: 'msg-1',
    threadId: 'thread-grace',
    senderId: 'guest-grace',
    senderName: 'Grace Tchiloemba',
    senderRole: 'guest',
    text: "Bonjour ! Est-ce que la confiserie est ouverte pour la séance de ce soir ? Est-ce qu'on peut acheter du pop-corn sur place ?",
    timestamp: '2026-06-25T14:32:00Z',
    phoneNumber: '+242 06 444 11 22',
    email: 'grace@example.com',
    readByAdmin: false,
    readByClient: true
  },
  {
    id: 'msg-2',
    threadId: 'u3', // Sarah Mavoungou (student user u3)
    senderId: 'u3',
    senderName: 'Sarah Mavoungou',
    senderRole: 'client',
    text: "Bonjour, j'ai réservé 3 billets tarif étudiant pour le film Noise. Est-ce qu'il faut présenter un justificatif ou une carte d'étudiant à l'entrée du cinéma ?",
    timestamp: '2026-06-25T16:15:00Z',
    phoneNumber: '+242 05 600 77 88',
    email: 'etudiant@icicine.cg',
    readByAdmin: false,
    readByClient: true
  }
];

