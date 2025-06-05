export type Database = {
  public: {
    Tables: {
      consumption: {
        Row: {
          id: string;
          drink_id: string;
          quantity: number;
          units: number;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          drink_id: string;
          quantity: number;
          units: number;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          drink_id?: string;
          quantity?: number;
          units?: number;
          timestamp?: string;
          user_id?: string | null;
        };
      };
      drinks: {
        Row: {
          id: string;
          name: string;
          type: string;
          category?: string;
          volume_ml: number;
          abv: number;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          category?: string;
          volume_ml: number;
          abv: number;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          category?: string;
          volume_ml?: number;
          abv?: number;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          drink_id: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          drink_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          drink_id?: string;
          created_at?: string;
        };
      };
      recents: {
        Row: {
          user_id: string;
          drink_id: string;
          last_used: string;
        };
        Insert: {
          user_id: string;
          drink_id: string;
          last_used?: string;
        };
        Update: {
          user_id?: string;
          drink_id?: string;
          last_used?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
        };
        Insert: {
          id: string;
          display_name: string;
        };
        Update: {
          id?: string;
          display_name?: string;
        };
      };
    };
  };
};
