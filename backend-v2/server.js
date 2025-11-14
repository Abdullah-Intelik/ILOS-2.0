/**
 * ILOS V2.0 - Server Entry Point
 * Multi-bank Loan Origination System
 */

require('dotenv').config();

const { createApp } = require('./src/app');
const { getDatabase } = require('./src/infrastructure/database/db');
const { getConfigService } = require('./src/config/config.service');

// ============================================================================
// Server Startup
// ============================================================================

async function startServer() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 ILOS V2.0 - Starting Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 1. Load Configuration
    const configService = getConfigService();
    const bank = configService.getBank();
    const features = configService.get('features');

    console.log(`📋 Bank: ${bank.name} (${bank.code})`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Features:`);
    console.log(`   - Instant Loan: ${features.instantLoan?.enabled ? '✅' : '❌'}`);
    console.log(`   - Mobile App: ${features.mobileApp?.enabled ? '✅' : '❌'}`);
    console.log(`   - Automation: ${features.automation?.enabled ? '✅' : '❌'}`);
    console.log('');

    // 2. Connect to Database
    const db = getDatabase();
    await db.connect();

    // 3. Create Express App
    const app = createApp(db);

    // 4. Start Server
    const PORT = process.env.PORT || 6000;
    const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for mobile app access

    const server = app.listen(PORT, HOST, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server running at http://${HOST}:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log(`📡 API Endpoints:`);
      console.log(`   Health: http://${HOST}:${PORT}/api/v1/health`);
      console.log(`   Applications: http://${HOST}:${PORT}/api/v1/applications`);
      console.log(`   Parties: http://${HOST}:${PORT}/api/v1/parties`);
      console.log(`   Dashboard: http://${HOST}:${PORT}/api/v1/dashboard`);
      console.log('');
      console.log(`💡 Press Ctrl+C to stop`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // 5. Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      console.log('');
      console.log(`📴 Received ${signal}. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          await db.disconnect();
          console.log('✅ Database connections closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after 10s');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

