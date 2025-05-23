// server/config/db.js (Example - USE WITH CAUTION)
import mongoose from 'mongoose';
import colors from 'colors';
import tls from 'tls'; // Import the tls module

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options force specific TLS versions.
      // Atlas generally prefers TLS 1.2 or higher.
      // Try one at a time if you suspect a version issue.
      // tlsAllowInvalidHostnames: true, // DANGEROUS, only for extreme debugging
      // tlsAllowInvalidCertificates: true, // DANGEROUS
      // tls MinVersion/MaxVersion might be needed by some older drivers or specific contexts
      // but typically not for modern Node.js and Atlas.
      // The driver usually negotiates this automatically.

      // More likely, ensure your system's OpenSSL is up-to-date
      // or if a proxy is interfering.
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    console.error('Full MongoDB Connection Error Object:'.red, error); // Log the full error
    process.exit(1);
  }
};
export default connectDB;