const db = require('../db1');
const DepartmentChangeTracker = require('./DepartmentChangeTracker');

/**
 * Database Change Processor
 * Processes database audit records and integrates them with department change tracking
 */
class DatabaseChangeProcessor {
    constructor() {
        this.changeTracker = new DepartmentChangeTracker({
            blockchainServiceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:5004',
            persistenceEnabled: true
        });
        this.isProcessing = false;
        console.log('🔍 DatabaseChangeProcessor initialized');
    }

    /**
     * Process unprocessed database audit records
     */
    async processAuditRecords() {
        if (this.isProcessing) {
            console.log('⏳ Audit processing already in progress, skipping...');
            return;
        }
        
        try {
            this.isProcessing = true;
            console.log('🔍 Processing database audit records...');

            // Get unprocessed high-risk or sensitive changes
            const auditQuery = `
                SELECT * FROM database_change_audit 
                WHERE processed_by_tracker = FALSE 
                AND (sensitive_fields_changed = TRUE OR risk_score >= 5)
                ORDER BY changed_at DESC
                LIMIT 20
            `;

            const result = await db.query(auditQuery);
            const auditRecords = result.rows;

            if (auditRecords.length === 0) {
                console.log('📝 No unprocessed audit records found');
                return 0;
            }

            console.log(`📋 Found ${auditRecords.length} unprocessed audit records`);

            let processedCount = 0;
            for (const audit of auditRecords) {
                try {
                    await this.processAuditRecord(audit);
                    processedCount++;
                } catch (error) {
                    console.error(`❌ Error processing audit record ${audit.id}:`, error.message);
                    // Continue with other records
                }
            }

            console.log(`✅ Successfully processed ${processedCount}/${auditRecords.length} audit records`);
            return processedCount;
            
        } catch (error) {
            console.error('❌ Error in audit record processing:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Process individual audit record
     */
    async processAuditRecord(audit) {
        try {
            console.log(`📋 Processing audit record ${audit.id}: ${audit.table_name}:${audit.record_id} (${audit.operation})`);

            // Convert database changes to department change format
            const fieldChanges = [];

            if (audit.operation === 'UPDATE' && audit.changed_fields && audit.changed_fields.length > 0) {
                for (const fieldName of audit.changed_fields) {
                    const oldValue = audit.old_values?.[fieldName];
                    const newValue = audit.new_values?.[fieldName];

                    // Skip system fields that are not user-relevant
                    if (this.isSystemField(fieldName)) {
                        continue;
                    }

                    fieldChanges.push({
                        fieldName: fieldName,
                        fieldPath: `database.${audit.table_name}.${fieldName}`,
                        oldValue: this.formatValue(oldValue),
                        newValue: this.formatValue(newValue),
                        changeReason: `Direct database modification detected - Risk Score: ${audit.risk_score}`
                    });
                }
            } else if (audit.operation === 'INSERT') {
                // For inserts, record the creation
                fieldChanges.push({
                    fieldName: 'record_created',
                    fieldPath: `database.${audit.table_name}.record_created`,
                    oldValue: 'null',
                    newValue: 'created',
                    changeReason: 'New record created via direct database access'
                });
            } else if (audit.operation === 'DELETE') {
                // For deletes, record the deletion
                fieldChanges.push({
                    fieldName: 'record_deleted',
                    fieldPath: `database.${audit.table_name}.record_deleted`,
                    oldValue: 'exists',
                    newValue: 'deleted',
                    changeReason: 'Record deleted via direct database access'
                });
            }

            // Only create change record if we have relevant field changes
            if (fieldChanges.length > 0) {
                const changeRecord = await this.changeTracker.recordDepartmentChange({
                    losId: audit.record_id,
                    department: 'DATABASE_AUDIT',
                    officer: audit.changed_by || 'DIRECT_DB_ACCESS',
                    fieldChanges: fieldChanges,
                    context: {
                        workflowStage: 'DATABASE_DIRECT',
                        businessReason: 'Direct database modification detected by audit triggers',
                        auditRecordId: audit.id,
                        tableName: audit.table_name,
                        operation: audit.operation,
                        riskScore: audit.risk_score,
                        detectedAt: audit.changed_at,
                        sensitiveFieldsChanged: audit.sensitive_fields_changed,
                        totalFieldsChanged: audit.changed_fields ? audit.changed_fields.length : 0
                    }
                });

                // Mark as processed with the tracker record ID
                await db.query(
                    'UPDATE database_change_audit SET processed_by_tracker = TRUE, tracker_record_id = $1 WHERE id = $2',
                    [changeRecord.id, audit.id]
                );

                console.log(`✅ Created change record ${changeRecord.id} for audit ${audit.id} (${fieldChanges.length} fields)`);
                
                // Log high-risk changes
                if (audit.risk_score >= 7) {
                    console.log(`🚨 HIGH-RISK DATABASE CHANGE: LOS-${audit.record_id} - Risk: ${audit.risk_score}/10`);
                }
            } else {
                // Mark as processed even if no relevant changes
                await db.query(
                    'UPDATE database_change_audit SET processed_by_tracker = TRUE WHERE id = $1',
                    [audit.id]
                );
                console.log(`✅ Marked audit ${audit.id} as processed (no relevant field changes)`);
            }

        } catch (error) {
            console.error(`❌ Error processing audit record ${audit.id}:`, error);
            throw error;
        }
    }

    /**
     * Check if field is a system field that shouldn't be tracked
     */
    isSystemField(fieldName) {
        const systemFields = [
            'created_at', 'updated_at', 'last_modified',
            'id', 'uuid', 'version', 'revision',
            'created_by', 'updated_by', 'modified_by'
        ];
        return systemFields.includes(fieldName.toLowerCase());
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (value === null || value === undefined) {
            return 'null';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    /**
     * Start periodic processing of audit records
     */
    startPeriodicProcessing(intervalMs = 30000) {
        console.log(`🔄 Starting periodic audit processing every ${intervalMs}ms (${intervalMs/1000}s)`);
        
        // Process immediately on startup
        setTimeout(() => {
            this.processAuditRecords().catch(error => {
                console.error('❌ Initial audit processing failed:', error);
            });
        }, 5000); // Wait 5 seconds for system to be ready
        
        // Then process periodically
        this.processingInterval = setInterval(() => {
            this.processAuditRecords().catch(error => {
                console.error('❌ Periodic audit processing failed:', error);
            });
        }, intervalMs);

        console.log('✅ Periodic audit processing started');
    }

    /**
     * Stop periodic processing
     */
    stopPeriodicProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            console.log('🛑 Periodic audit processing stopped');
        }
    }

    /**
     * Get database changes summary
     */
    async getDatabaseChangesSummary(losId = null, limit = 50) {
        try {
            let query = `
                SELECT 
                    id,
                    table_name,
                    record_id as los_id,
                    operation,
                    changed_by,
                    changed_at,
                    changed_fields,
                    sensitive_fields_changed,
                    risk_score,
                    CASE 
                        WHEN risk_score >= 8 THEN 'CRITICAL'
                        WHEN risk_score >= 5 THEN 'HIGH'
                        WHEN risk_score >= 3 THEN 'MEDIUM'
                        ELSE 'LOW'
                    END as risk_level,
                    processed_by_tracker,
                    tracker_record_id,
                    old_values,
                    new_values
                FROM database_change_audit
            `;
            
            let params = [];

            if (losId) {
                query += ' WHERE record_id = $1';
                params = [losId];
            }

            query += ` ORDER BY changed_at DESC LIMIT ${limit}`;

            const result = await db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting database changes summary:', error);
            throw error;
        }
    }

    /**
     * Get detailed change analysis for a specific LOS
     */
    async getDetailedChangesForLos(losId) {
        try {
            const query = `
                SELECT 
                    dca.*,
                    CASE 
                        WHEN dca.risk_score >= 8 THEN 'CRITICAL'
                        WHEN dca.risk_score >= 5 THEN 'HIGH'
                        WHEN dca.risk_score >= 3 THEN 'MEDIUM'
                        ELSE 'LOW'
                    END as risk_level
                FROM database_change_audit dca
                WHERE dca.record_id = $1
                ORDER BY dca.changed_at DESC
            `;

            const result = await db.query(query, [losId]);
            const changes = result.rows;

            // Analyze the changes
            const analysis = {
                totalChanges: changes.length,
                highRiskChanges: changes.filter(c => c.risk_score >= 7).length,
                sensitiveChanges: changes.filter(c => c.sensitive_fields_changed).length,
                unprocessedChanges: changes.filter(c => !c.processed_by_tracker).length,
                tablesAffected: [...new Set(changes.map(c => c.table_name))],
                timeRange: changes.length > 0 ? {
                    earliest: changes[changes.length - 1].changed_at,
                    latest: changes[0].changed_at
                } : null,
                changes: changes
            };

            return analysis;
        } catch (error) {
            console.error(`Error getting detailed changes for LOS ${losId}:`, error);
            throw error;
        }
    }

    /**
     * Force process all unprocessed records (manual trigger)
     */
    async forceProcessAllUnprocessed() {
        console.log('🔄 Force processing ALL unprocessed audit records...');
        
        try {
            const query = `
                SELECT COUNT(*) as count 
                FROM database_change_audit 
                WHERE processed_by_tracker = FALSE
            `;
            
            const countResult = await db.query(query);
            const totalUnprocessed = parseInt(countResult.rows[0].count);
            
            console.log(`📊 Found ${totalUnprocessed} unprocessed records`);
            
            if (totalUnprocessed === 0) {
                return { processed: 0, total: 0 };
            }

            // Process in batches
            let totalProcessed = 0;
            let batchSize = 20;
            
            while (true) {
                const processed = await this.processAuditRecords();
                totalProcessed += processed;
                
                if (processed < batchSize) {
                    break; // No more records to process
                }
            }
            
            console.log(`✅ Force processing completed: ${totalProcessed}/${totalUnprocessed} records processed`);
            
            return {
                processed: totalProcessed,
                total: totalUnprocessed
            };
            
        } catch (error) {
            console.error('❌ Error in force processing:', error);
            throw error;
        }
    }

    /**
     * Health check for the processor
     */
    async getHealthStatus() {
        try {
            const stats = await db.query(`
                SELECT 
                    COUNT(*) as total_audits,
                    COUNT(*) FILTER (WHERE processed_by_tracker = TRUE) as processed_audits,
                    COUNT(*) FILTER (WHERE processed_by_tracker = FALSE) as pending_audits,
                    COUNT(*) FILTER (WHERE risk_score >= 7) as high_risk_audits,
                    COUNT(*) FILTER (WHERE sensitive_fields_changed = TRUE) as sensitive_audits
                FROM database_change_audit
            `);

            const status = stats.rows[0];
            
            return {
                status: 'operational',
                isProcessing: this.isProcessing,
                hasPeriodicProcessing: !!this.processingInterval,
                statistics: {
                    totalAudits: parseInt(status.total_audits),
                    processedAudits: parseInt(status.processed_audits),
                    pendingAudits: parseInt(status.pending_audits),
                    highRiskAudits: parseInt(status.high_risk_audits),
                    sensitiveAudits: parseInt(status.sensitive_audits)
                },
                processingRate: status.total_audits > 0 ? 
                    Math.round((status.processed_audits / status.total_audits) * 100) : 100
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                isProcessing: this.isProcessing,
                hasPeriodicProcessing: !!this.processingInterval
            };
        }
    }
}

module.exports = DatabaseChangeProcessor;
