# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birrino is a personal alcohol unit tracking application built with Next.js. It helps users monitor their alcohol consumption and understand their drinking habits relative to health guidelines (14 units per week).

## Tech Stack

- **Next.js 15.3.2** (App Router)
- **React 18+**
- **Tailwind CSS 3.x/4.x**
- **Supabase** (PostgreSQL database + API)
- **React Hot Toast** for notifications
- **TypeScript**

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Database Schema

The application uses Supabase with the following tables:

1. **users**
   ```sql
   create table users (
     id uuid primary key default gen_random_uuid(),
     name text not null unique
   );
   ```

2. **drinks**
   ```sql
   create table drinks (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     volume_ml int not null,
     abv numeric(4,1) not null,
     type text not null
   );
   ```

3. **consumption**
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

## Project Architecture

### Folder Structure
```
app/
  layout.tsx          # Global layout (<Toaster /> included)
  page.tsx            # User selection page
  [user]/
    page.tsx          # User dashboard
components/
  UserSelect.tsx
  DrinkForm.tsx
  SummaryStats.tsx
lib/
  supabaseClient.ts
  calculations.ts
```

### Core Components
- **UserSelect** – Input a name, then redirects to `/<name>`
- **DrinkForm** – Quantity + drink selector, then saves to Supabase
- **SummaryStats** – Shows alcohol units for evening, day, week, month and year

## Key Functions

### Alcohol Unit Calculation
```ts
export function calculateUnits(
  volumeMl: number,
  abv: number,
  qty: number
): number {
  // Formula: Units = (volume_ml × abv × qty) / 1000
  return (volumeMl * abv * qty) / 1000;
}
```

### Example Queries

Insert a new entry:
```ts
const { error } = await supabase.from("consumption").insert({
  user_name: user,
  drink_id: drinkId,
  quantity: qty,
  units: calculateUnits(vol, abv, qty),
});
```

Fetch all entries for a user:
```ts
const { data } = await supabase
  .from("consumption")
  .select("*")
  .eq("user_name", user);
```

### Weekly-Limit Toast
```ts
import { toast } from "react-hot-toast";
if (weekTotal > 14) {
  toast("You have exceeded 14 units this week");
}
```

## Environment Setup

Create an `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=<project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```