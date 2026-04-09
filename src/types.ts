export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface MultiplierHistory {
  id: number;
  multiplier: number;
  timestamp: string;
}

export interface Prediction {
  id?: number;
  multiplier: number;
  confidence: number;
  riskLevel: 'Safe' | 'Medium' | 'Risky';
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
