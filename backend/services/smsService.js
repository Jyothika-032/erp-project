/**
 * SMS Service — Mock/Simulation Mode
 * 
 * Currently simulates SMS sending by logging to console.
 * To enable real SMS, integrate Twilio here:
 *   npm install twilio --prefix backend
 *   const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 */

/**
 * Send an SMS message (simulated).
 * @param {Object} options
 * @param {string} options.to      - Recipient phone number
 * @param {string} options.message - SMS body text
 * @returns {{ success: boolean, status: string }}
 */
async function sendSms({ to, message }) {
  try {
    // --- Twilio real SMS (uncomment when ready) ---
    // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });

    // Simulation mode — log to console
    console.log('📱 SMS (Simulated):');
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);

    return { success: true, status: 'delivered' };
  } catch (error) {
    console.error('❌ SMS send failed:', error.message);
    return { success: false, status: 'failed', error: error.message };
  }
}

module.exports = { sendSms };
