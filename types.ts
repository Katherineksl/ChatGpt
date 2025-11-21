export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export enum AuthState {
  UNAUTHENTICATED,
  AUTHENTICATED,
  LOADING
}