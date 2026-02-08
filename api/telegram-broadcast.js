export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transaction } = req.body;
    
    // Validate required fields
    if (!transaction || !transaction.tx_id || !transaction.sender || !transaction.receiver) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    // Get bot token from environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "@gsc_vags_bot";

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ error: 'Telegram bot not configured' });
    }

    // Create structured message
    const structuredMessage = {
      type: "GSC_TRANSACTION",
      timestamp: new Date().toISOString(),
      transaction: {
        tx_id: transaction.tx_id,
        sender: transaction.sender,
        receiver: transaction.receiver,
        amount: transaction.amount,
        fee: transaction.fee,
        timestamp: transaction.timestamp,
        signature: transaction.signature || ""
      }
    };

    // Format message for Telegram
    const message = `🔄 GSC VAGS Transaction Broadcast

\`\`\`json
${JSON.stringify(structuredMessage, null, 2)}
\`\`\`

📡 Broadcast via @gsc_vags_bot`;

    // Send to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const telegramData = await telegramResponse.json();

    if (telegramResponse.ok && telegramData.ok) {
      console.log('✅ Transaction broadcasted to Telegram successfully');
      return res.status(200).json({ 
        success: true, 
        message: 'Transaction broadcasted successfully',
        telegram_response: telegramData
      });
    } else {
      console.error('❌ Telegram API error:', telegramData);
      return res.status(500).json({ 
        error: 'Failed to broadcast to Telegram',
        telegram_error: telegramData
      });
    }

  } catch (error) {
    console.error('❌ Broadcast error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
