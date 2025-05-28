# Birrino - Alcohol Unit Tracker

Birrino is a clean, minimalist web application for tracking alcohol consumption. It helps users monitor their alcohol units and stay within healthy limits (recommended 14 units per week).

## Features

- Track alcohol consumption by units
- Select from predefined drinks with standard volumes and ABV percentages
- View summaries for evening, day, week, month, and year
- Multiple user profiles
- Visual progress indicators
- Notifications when exceeding recommended limits

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Supabase account with configured tables

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd birrino
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following Supabase tables:

### users
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);
```

### drinks
```sql
create table drinks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  volume_ml int not null,
  abv numeric(4,1) not null,
  type text not null
);
```

### consumption
```sql
create table consumption (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  drink_id uuid references drinks(id),
  quantity int not null check (quantity > 0),
  units numeric(6,3) not null,
  timestamp timestamptz default now()
);
```

## Usage

1. Select or create a user profile
2. Select a drink type and specific drink
3. Adjust the quantity using the slider
4. Click "Add Drink" to record your consumption
5. View your consumption summary in the stats panel
6. Receive notifications when you exceed 14 units per week

## Building for Production

To create a production build:

```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.