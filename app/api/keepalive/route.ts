import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

export async function GET(request: Request) {
  // Extract and validate secret parameter
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  
  if (secret !== process.env.KEEPALIVE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Perform lightweight database queries to keep Supabase alive
    await Promise.all([
      supabaseAdmin.from('drinks').select('id').limit(1),
      supabaseAdmin.from('consumption').select('id').limit(1)
    ]);
    
    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      tables_checked: ['drinks', 'consumption'],
      status: 'Database connection successful'
    });
  } catch (err) {
    console.error('Keepalive failed:', err);
    return NextResponse.json({ 
      ok: false, 
      error: (err as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
