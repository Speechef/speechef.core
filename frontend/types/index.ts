export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Profile {
  user: User;
  image: string | null;
  current_streak: number;
  longest_streak: number;
  last_played_date: string | null;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  created_on: string;
  last_modified: string;
  completed: boolean;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  author: string;
  body: string;
  created_on: string;
}

export interface WordQuestion {
  id: number;
  word: string;
  correct_meaning: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface GameSession {
  id: number;
  game: 'guess' | 'memory' | 'scramble';
  score: number;
  played_at: string;
}

export interface LeaderboardEntry {
  username: string;
  avatar: string | null;
  total_score: number;
  games_played: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  job_type: string;
  job_rate: number | null;
  location: string;
  url: string;
  date: string;
}
