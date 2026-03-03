import { NextResponse } from 'next/server';
import { processNotifications } from '@/lib/services/notificationService';

export async function GET(request: Request) {
    // Verificação simples de Secret para evitar abusos via cron
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await processNotifications();
        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('❌ Erro no processamento de notificações via API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
