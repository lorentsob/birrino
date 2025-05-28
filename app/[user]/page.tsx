'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import DrinkForm from '@/components/DrinkForm';
import SummaryStats from '@/components/SummaryStats';

export default function UserPage({ 
  params, 
  searchParams 
}: {
  params: Promise<{ user: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Utilizziamo React.use() per accedere ai parametri
  const resolvedParams = use(params);
  const userName = decodeURIComponent(resolvedParams.user);

  const handleDrinkAdded = () => {
    // Increment the refresh trigger to update the stats
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hello, {userName}</h1>
          <p className="text-gray-600">Track your alcohol consumption</p>
        </div>
        <Link href="/" className="btn btn-secondary text-sm">
          Change User
        </Link>
      </header>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:order-2">
          <DrinkForm 
            userName={userName} 
            onDrinkAdded={handleDrinkAdded} 
          />
        </div>
        
        <div className="md:order-1">
          <SummaryStats 
            userName={userName} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
    </div>
  );
}