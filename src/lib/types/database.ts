export type BingoColumn = 'B' | 'I' | 'N' | 'G' | 'O';

export interface BingoCardMatrix {
  B: number[];
  I: number[];
  N: (number | 'FREE')[];
  G: number[];
  O: number[];
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  vip_level: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  bonus_balance: number;
  currency: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'card_purchase' | 'game_prize' | 'refund' | 'admin_adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type GameStatus = 'waiting' | 'countdown' | 'in_progress' | 'completed' | 'cancelled';

export interface Game {
  id: string;
  game_code: string;
  room_name: string;
  card_price: number;
  max_cards_per_user: number;
  status: GameStatus;
  jackpot_amount: number;
  line_prize: number;
  bingo_prize: number;
  drawn_numbers: number[];
  current_ball: number | null;
  ball_draw_interval_seconds: number;
  auto_daub_enabled: boolean;
  scheduled_start: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface GameParticipantCard {
  id: string;
  game_id: string;
  user_id: string;
  card_number: number;
  matrix: BingoCardMatrix;
  marked_cells: string[]; // e.g. ["FREE", "B-5", "N-33"] or values
  has_line: boolean;
  has_bingo: boolean;
  purchased_at: string;
}

export interface GameWinner {
  id: string;
  game_id: string;
  user_id: string;
  participant_card_id: string;
  prize_type: 'line' | 'bingo' | 'jackpot';
  prize_amount: number;
  winning_ball: number;
  claimed_at: string;
  username?: string;
}

export interface BallCallout {
  number: number;
  letter: BingoColumn;
  timestamp: number;
}

