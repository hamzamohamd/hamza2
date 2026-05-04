export interface User {
  id: number;
  username: string;
  role: 'donor' | 'charity' | 'admin';
  email?: string;
  phone?: string;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  charity_id: number;
  start_date: string;
  end_date: string;
}

export interface Donation {
  id: number;
  donor_id: number;
  campaign_id: number;
  amount: number;
  date: string;
  payment_method: string;
}
