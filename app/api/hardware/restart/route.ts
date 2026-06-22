import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const res = await fetch('http://192.168.0.111:5000/restart', {
      method: 'POST',
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`Failed to restart: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Jetson telemetry server for restart.' },
      { status: 502 }
    );
  }
}
