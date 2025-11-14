const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Enhanced Department Change Tracker
 * Provides immutable audit trail for department-specific changes with blockchain integration
 */
class DepartmentChangeTracker {
    constructor(options = {}) {
        this.blockchainServiceUrl = options.blockchainServiceUrl || 'http://localhost:5004';
        this.dataDir = options.dataDir || path.join(__dirname, '../data/changes');
        this.changeChain = new Map(); // In-memory cache for fast access
        this.persistenceEnabled = options.persistenceEnabled !== false;
        
        // Ensure data directory exists
        this.ensureDataDir();
        
        // Load existing changes on startup
        this.loadPersistedChanges();
        
        console.log('🔗 DepartmentChangeTracker initialized');
    }

    /**
     * Ensure data directory exists for persistence
     */
    ensureDataDir() {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create data directory:', error.message);
        }
    }

    /**
     * Load persisted changes from disk
     */
    loadPersistedChanges() {
        if (!this.persistenceEnabled) return;
        
        try {
            const files = fs.readdirSync(this.dataDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.dataDir, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    const chainKey = data.chainKey;
                    this.changeChain.set(chainKey, data.changes);
                }
            });
            console.log(`📂 Loaded ${files.length} change chain files`);
        } catch (error) {
            console.error('Failed to load persisted changes:', error.message);
        }
    }

    /**
     * Persist changes to disk
     */
    persistChanges(chainKey) {
        if (!this.persistenceEnabled) return;
        
        try {
            const changes = this.changeChain.get(chainKey) || [];
            const fileName = `${chainKey.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            const filePath = path.join(this.dataDir, fileName);
            
            fs.writeFileSync(filePath, JSON.stringify({
                chainKey,
                changes,
                lastUpdated: new Date().toISOString()
            }, null, 2));
        } catch (error) {
            console.error('Failed to persist changes:', error.message);
        }
    }

    /**
     * Record a new department-specific change
     */
    async recordDepartmentChange(changeData) {
        try {
            const { losId, department, officer, fieldChanges, context } = changeData;
            
            // Validate required fields
            if (!losId || !department || !officer || !fieldChanges) {
                throw new Error('Missing required fields: losId, department, officer, fieldChanges');
            }

            // Generate unique change ID
            const changeId = crypto.randomUUID();
            const timestamp = new Date().toISOString();
            
            // Calculate field-level hashes
            const hashedChanges = await this.hashFieldChanges(fieldChanges);
            
            // Get previous change for chaining
            const chainKey = `${losId}_${department.toUpperCase()}`;
            const previousChanges = this.changeChain.get(chainKey) || [];
            const previousHash = previousChanges.length > 0 
                ? previousChanges[previousChanges.length - 1].compositeHash 
                : 'genesis';
            
            // Create composite hash for this change
            const compositeHash = this.createCompositeHash(losId, department, hashedChanges, timestamp, previousHash);
            
            // Create change record
            const changeRecord = {
                id: changeId,
                losId,
                department: department.toUpperCase(),
                officer,
                timestamp,
                changeType: this.determineChangeType(fieldChanges),
                fieldChanges: hashedChanges,
                departmentContext: context || {},
                previousHash,
                compositeHash,
                sequence: previousChanges.length + 1
            };
            
            // Store in blockchain
            const blockchainResult = await this.storeInBlockchain(changeRecord);
            changeRecord.blockchain = blockchainResult;
            
            // Add to change chain
            if (!this.changeChain.has(chainKey)) {
                this.changeChain.set(chainKey, []);
            }
            this.changeChain.get(chainKey).push(changeRecord);
            
            // Persist to disk
            this.persistChanges(chainKey);
            
            console.log(`✅ Recorded change ${changeId} for ${department} on LOS-${losId}`);
            return changeRecord;
            
        } catch (error) {
            console.error('Failed to record department change:', error);
            throw error;
        }
    }

    /**
     * Hash individual field changes with enhanced metadata
     */
    async hashFieldChanges(fieldChanges) {
        return fieldChanges.map(change => {
            // Create structured field data for hashing
            const fieldData = {
                fieldName: change.fieldName,
                fieldPath: change.fieldPath || change.fieldName,
                oldValue: this.normalizeValue(change.oldValue),
                newValue: this.normalizeValue(change.newValue),
                changeReason: change.changeReason || 'Not specified',
                timestamp: new Date().toISOString()
            };
            
            // Calculate individual hashes
            const oldHash = crypto.createHash('sha256')
                .update(`${fieldData.fieldName}:${fieldData.oldValue}`)
                .digest('hex');
            
            const newHash = crypto.createHash('sha256')
                .update(`${fieldData.fieldName}:${fieldData.newValue}`)
                .digest('hex');
            
            const changeHash = crypto.createHash('sha256')
                .update(`${oldHash}->${newHash}:${fieldData.changeReason}`)
                .digest('hex');
            
            // Determine sensitivity and risk level
            const sensitivity = this.classifyFieldSensitivity(change.fieldName);
            const riskScore = this.calculateRiskScore(change.oldValue, change.newValue, sensitivity);
            
            return {
                ...fieldData,
                oldHash,
                newHash,
                changeHash,
                sensitivity,
                riskScore,
                requiresApproval: riskScore > 7 || sensitivity === 'HIGH'
            };
        });
    }

    /**
     * Normalize values for consistent hashing
     */
    normalizeValue(value) {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    /**
     * Classify field sensitivity for risk assessment
     */
    classifyFieldSensitivity(fieldName) {
        const fieldLower = fieldName.toLowerCase();
        
        // High sensitivity fields
        if (fieldLower.includes('amount') || fieldLower.includes('salary') || 
            fieldLower.includes('income') || fieldLower.includes('cnic') ||
            fieldLower.includes('account') || fieldLower.includes('phone')) {
            return 'HIGH';
        }
        
        // Medium sensitivity fields
        if (fieldLower.includes('name') || fieldLower.includes('address') ||
            fieldLower.includes('employer') || fieldLower.includes('email')) {
            return 'MEDIUM';
        }
        
        // Low sensitivity fields
        return 'LOW';
    }

    /**
     * Calculate risk score for a field change
     */
    calculateRiskScore(oldValue, newValue, sensitivity) {
        let baseScore = sensitivity === 'HIGH' ? 5 : sensitivity === 'MEDIUM' ? 3 : 1;
        
        // Increase score for significant changes
        if (typeof oldValue === 'string' && typeof newValue === 'string') {
            const oldNum = parseFloat(oldValue.replace(/[^0-9.-]/g, ''));
            const newNum = parseFloat(newValue.replace(/[^0-9.-]/g, ''));
            
            if (!isNaN(oldNum) && !isNaN(newNum)) {
                const percentChange = Math.abs((newNum - oldNum) / oldNum) * 100;
                if (percentChange > 50) baseScore += 3;
                else if (percentChange > 20) baseScore += 2;
                else if (percentChange > 10) baseScore += 1;
            }
        }
        
        return Math.min(baseScore, 10); // Cap at 10
    }

    /**
     * Determine the type of change based on field modifications
     */
    determineChangeType(fieldChanges) {
        const hasFinancialFields = fieldChanges.some(change => 
            change.fieldName.toLowerCase().includes('amount') ||
            change.fieldName.toLowerCase().includes('salary') ||
            change.fieldName.toLowerCase().includes('income')
        );
        
        const hasPersonalFields = fieldChanges.some(change => 
            change.fieldName.toLowerCase().includes('name') ||
            change.fieldName.toLowerCase().includes('cnic') ||
            change.fieldName.toLowerCase().includes('phone')
        );
        
        if (hasFinancialFields) return 'FINANCIAL_MODIFICATION';
        if (hasPersonalFields) return 'PERSONAL_DATA_MODIFICATION';
        if (fieldChanges.length > 5) return 'BULK_MODIFICATION';
        
        return 'FIELD_MODIFICATION';
    }

    /**
     * Create department-specific composite hash
     */
    createCompositeHash(losId, department, hashedChanges, timestamp, previousHash) {
        const changeData = {
            losId,
            department: department.toUpperCase(),
            timestamp,
            previousHash,
            changes: hashedChanges.map(c => ({
                field: c.fieldName,
                changeHash: c.changeHash,
                risk: c.riskScore
            }))
        };
        
        return crypto.createHash('sha256')
            .update(JSON.stringify(changeData))
            .digest('hex');
    }

    /**
     * Store change record in blockchain
     */
    async storeInBlockchain(changeRecord) {
        try {
            const blockchainPayload = {
                losId: changeRecord.losId,
                department: changeRecord.department,
                formData: Buffer.from(JSON.stringify({
                    changeId: changeRecord.id,
                    changeType: changeRecord.changeType,
                    compositeHash: changeRecord.compositeHash,
                    fieldHashes: changeRecord.fieldChanges.map(c => c.changeHash),
                    timestamp: changeRecord.timestamp,
                    sequence: changeRecord.sequence
                })).toString('base64'),
                version: "2.0",
                signer: changeRecord.officer
            };

            console.log(`🔗 Storing change ${changeRecord.id} in blockchain...`);
            const response = await axios.post(
                `${this.blockchainServiceUrl}/api/hash/create`,
                blockchainPayload,
                { timeout: 10000 }
            );

            if (response.data && response.data.success) {
                return {
                    txId: response.data.data.txId,
                    blockNumber: response.data.data.blockNumber,
                    chainHash: response.data.data.hash,
                    verificationStatus: 'VERIFIED',
                    network: response.data.blockchain?.network || 'Real Hyperledger Fabric'
                };
            } else {
                throw new Error('Blockchain storage failed: ' + JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Blockchain storage failed:', error.message);
            return {
                txId: null,
                blockNumber: null,
                chainHash: null,
                verificationStatus: 'FAILED',
                error: error.message
            };
        }
    }

    /**
     * Get complete change history for a LOS by department
     */
    async getDepartmentChangeHistory(losId, department = null) {
        const changes = [];
        
        if (department) {
            // Get changes for specific department
            const chainKey = `${losId}_${department.toUpperCase()}`;
            const departmentChanges = this.changeChain.get(chainKey) || [];
            changes.push(...departmentChanges);
        } else {
            // Get changes for all departments
            for (const [key, chainChanges] of this.changeChain.entries()) {
                if (key.startsWith(`${losId}_`)) {
                    changes.push(...chainChanges);
                }
            }
        }
        
        // Sort by timestamp
        return changes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Verify integrity of department change chain
     */
    async verifyDepartmentChanges(losId, department) {
        try {
            const changes = await this.getDepartmentChangeHistory(losId, department);
            const verificationResults = [];
            
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                
                // Verify hash chain integrity
                const expectedPreviousHash = i === 0 ? 'genesis' : changes[i - 1].compositeHash;
                const hashChainValid = (change.previousHash === expectedPreviousHash);
                
                // Recalculate composite hash
                const expectedCompositeHash = this.createCompositeHash(
                    change.losId,
                    change.department,
                    change.fieldChanges,
                    change.timestamp,
                    change.previousHash
                );
                const compositeHashValid = (expectedCompositeHash === change.compositeHash);
                
                // Check blockchain verification
                const blockchainValid = change.blockchain && 
                    change.blockchain.verificationStatus === 'VERIFIED' &&
                    change.blockchain.txId !== null;
                
                verificationResults.push({
                    changeId: change.id,
                    sequence: change.sequence,
                    hashChainValid,
                    compositeHashValid,
                    blockchainValid,
                    timestamp: change.timestamp,
                    department: change.department,
                    riskScore: change.fieldChanges.reduce((sum, fc) => sum + fc.riskScore, 0),
                    overallValid: hashChainValid && compositeHashValid && blockchainValid
                });
            }
            
            const allValid = verificationResults.every(r => r.overallValid);
            
            return {
                isValid: allValid,
                totalChanges: verificationResults.length,
                results: verificationResults,
                summary: {
                    validChanges: verificationResults.filter(r => r.overallValid).length,
                    invalidChanges: verificationResults.filter(r => !r.overallValid).length,
                    blockchainFailures: verificationResults.filter(r => !r.blockchainValid).length
                }
            };
            
        } catch (error) {
            console.error('Verification failed:', error);
            throw error;
        }
    }

    /**
     * Get department activity summary
     */
    async getDepartmentActivitySummary(losId) {
        const allChanges = await this.getDepartmentChangeHistory(losId);
        const summary = {};
        
        // Group by department
        allChanges.forEach(change => {
            if (!summary[change.department]) {
                summary[change.department] = {
                    department: change.department,
                    totalChanges: 0,
                    lastActivity: null,
                    riskScore: 0,
                    changeTypes: {},
                    officers: new Set()
                };
            }
            
            const deptSummary = summary[change.department];
            deptSummary.totalChanges++;
            deptSummary.lastActivity = change.timestamp;
            deptSummary.riskScore += change.fieldChanges.reduce((sum, fc) => sum + fc.riskScore, 0);
            deptSummary.changeTypes[change.changeType] = (deptSummary.changeTypes[change.changeType] || 0) + 1;
            deptSummary.officers.add(change.officer);
        });
        
        // Convert officers Set to array
        Object.values(summary).forEach(dept => {
            dept.officers = Array.from(dept.officers);
            dept.averageRiskScore = dept.totalChanges > 0 ? dept.riskScore / dept.totalChanges : 0;
        });
        
        return summary;
    }
}

module.exports = DepartmentChangeTracker;
