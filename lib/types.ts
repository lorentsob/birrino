export type User = {
  id: string;
  name: string;
};

export type Drink = {
  id: string;
  name: string;
  volume_ml: number;
  abv: number;
  type: string;
};

export type Consumption = {
  id: string;
  user_name: string;
  drink_id: string;
  quantity: number;
  units: number;
  timestamp: string;
};

export type PeriodType = 'evening' | 'day' | 'week' | 'month' | 'year';