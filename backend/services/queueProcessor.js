const cron = require('node-cron');
const { processQueuedApplications } = require('./autoAssignEavmu');
const config = require('../config/automation-config.json');

/**
 * Queue Processor Scheduler
 * Periodically processes queued applications when officers become available
 */

let scheduledTask = null;

function startQueueProcessor() {
  if (!config.queueProcessing.enabled) {
    console.log('⚠️ Queue processing is disabled in configuration');
    return;
  }

  const schedule = config.queueProcessing.schedule || '*/5 * * * *'; // Default: every 5 minutes
  
  console.log(`⏰ Starting queue processor with schedule: ${schedule}`);
  
  scheduledTask = cron.schedule(schedule, async () => {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`⏰ Queue processor triggered at ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);
      
      const result = await processQueuedApplications();
      
      if (result.processed > 0) {
        console.log(`✅ Queue processing completed:`);
        console.log(`   - Assigned: ${result.processed}`);
        console.log(`   - Still queued: ${result.remaining}`);
      } else {
        console.log(`✅ No queued applications to process`);
      }
    } catch (error) {
      console.error(`❌ Queue processor error:`, error.message);
    }
  });
  
  console.log('✅ Queue processor started successfully');
}

function stopQueueProcessor() {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('🛑 Queue processor stopped');
    scheduledTask = null;
  }
}

function getQueueProcessorStatus() {
  return {
    running: scheduledTask !== null,
    schedule: config.queueProcessing.schedule,
    enabled: config.queueProcessing.enabled
  };
}

// Auto-start on module load if enabled
if (config.queueProcessing.enabled) {
  // Wait a few seconds after server start before starting
  setTimeout(() => {
    startQueueProcessor();
  }, 5000);
}

module.exports = {
  startQueueProcessor,
  stopQueueProcessor,
  getQueueProcessorStatus
};

