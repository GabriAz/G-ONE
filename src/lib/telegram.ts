import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const globalChatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN não configurado no .env');
}

const bot = token ? new TelegramBot(token, { polling: false }) : null;

/**
 * Envia uma mensagem via Telegram
 * @param text Texto da mensagem (Markdown suportado)
 * @param chatId ID do chat opcional (usa o global se não informado)
 */
export async function sendTelegramMessage(text: string, chatId?: string) {
    const targetId = chatId || globalChatId;

    if (!bot || !targetId) {
        console.error('❌ Configuração de Telegram ausente: Bot ou ChatId não encontrados.');
        return null;
    }

    try {
        return await bot.sendMessage(targetId, text, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem Telegram:', error);
        return null;
    }
}

export default bot;
