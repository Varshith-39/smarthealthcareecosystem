const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / Node.js querySrv ECONNREFUSED issue when resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('Could not set custom DNS servers:', dnsErr.message);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_healthcare';

  if (uri.includes('<db_password>')) {
    console.warn('\n' + '='.repeat(65));
    console.warn('⚠️  [MongoDB Setup Needed]:');
    console.warn('Your MONGO_URI in backend/.env still has "<db_password>".');
    console.warn('👉 Replace "<db_password>" with your actual MongoDB Atlas password.');
    console.warn('='.repeat(65) + '\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (uri.includes('<db_password>')) {
      console.error('👉 TIP: Replace "<db_password>" in backend/.env with your real MongoDB Atlas password to connect.');
    } else {
      console.error('👉 TIP: Ensure your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).');
    }
  }
};

module.exports = connectDB;
