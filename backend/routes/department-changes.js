const express = require('express');
const router = express.Router();
const DepartmentChangeTracker = require('../lib/DepartmentChangeTracker');

// Initialize the change tracker
const changeTracker = new DepartmentChangeTracker({
    blockchainServiceUrl: process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:5004',
    dataDir: process.env.CHANGE_DATA_DIR || '../data/changes',
    persistenceEnabled: true
});

console.log('📋 Department Change Tracking API loaded');

/**
 * Record a new department change
 * POST /api/department-changes/record
 */
router.post('/record', async (req, res) => {
    try {
        const { losId, department, officer, fieldChanges, context } = req.body;
        
        // Validate required fields
        if (!losId || !department || !officer || !fieldChanges || !Array.isArray(fieldChanges)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: losId, department, officer, fieldChanges (array)'
            });
        }
        
        // Validate field changes structure
        for (const change of fieldChanges) {
            if (!change.fieldName || change.oldValue === undefined || change.newValue === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Each field change must have fieldName, oldValue, and newValue'
                });
            }
        }
        
        console.log(`📝 Recording change for LOS-${losId} by ${department}:${officer}`);
        console.log(`   Fields changed: ${fieldChanges.map(fc => fc.fieldName).join(', ')}`);
        
        // Record the change
        const changeRecord = await changeTracker.recordDepartmentChange({
            losId,
            department: department.toUpperCase(),
            officer,
            fieldChanges,
            context: context || {}
        });
        
        res.json({
            success: true,
            changeRecord: {
                id: changeRecord.id,
                losId: changeRecord.losId,
                department: changeRecord.department,
                timestamp: changeRecord.timestamp,
                changeType: changeRecord.changeType,
                compositeHash: changeRecord.compositeHash,
                sequence: changeRecord.sequence,
                blockchain: changeRecord.blockchain,
                fieldCount: changeRecord.fieldChanges.length,
                riskScore: changeRecord.fieldChanges.reduce((sum, fc) => sum + fc.riskScore, 0)
            },
            message: `Change recorded successfully for ${department} on LOS-${losId}`
        });
        
    } catch (error) {
        console.error('Error recording department change:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get change history for a LOS (specific department)
 * GET /api/department-changes/history/:losId/:department
 */
router.get('/history/:losId/:department', async (req, res) => {
    try {
        const { losId, department } = req.params;
        const { includeDetails } = req.query;
        
        console.log(`📖 Fetching change history for LOS-${losId}${department ? ` (${department})` : ' (all departments)'}`);
        
        const history = await changeTracker.getDepartmentChangeHistory(losId, department);
        
        // Filter details if not requested
        const responseHistory = history.map(change => {
            const baseChange = {
                id: change.id,
                losId: change.losId,
                department: change.department,
                officer: change.officer,
                timestamp: change.timestamp,
                changeType: change.changeType,
                sequence: change.sequence,
                compositeHash: change.compositeHash,
                blockchain: {
                    txId: change.blockchain.txId,
                    verificationStatus: change.blockchain.verificationStatus,
                    network: change.blockchain.network
                },
                fieldCount: change.fieldChanges.length,
                totalRiskScore: change.fieldChanges.reduce((sum, fc) => sum + fc.riskScore, 0)
            };
            
            if (includeDetails === 'true') {
                baseChange.fieldChanges = change.fieldChanges;
                baseChange.departmentContext = change.departmentContext;
            }
            
            return baseChange;
        });
        
        res.json({
            success: true,
            losId,
            department: department || 'ALL',
            totalChanges: responseHistory.length,
            history: responseHistory,
            summary: {
                departments: [...new Set(history.map(h => h.department))],
                changeTypes: [...new Set(history.map(h => h.changeType))],
                officers: [...new Set(history.map(h => h.officer))],
                timeRange: history.length > 0 ? {
                    earliest: history[0].timestamp,
                    latest: history[history.length - 1].timestamp
                } : null
            }
        });
        
    } catch (error) {
        console.error('Error fetching change history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get change history for a LOS (all departments)
 * GET /api/department-changes/history/:losId
 */
router.get('/history/:losId', async (req, res) => {
    try {
        const { losId } = req.params;
        const { includeDetails } = req.query;
        
        console.log(`📖 Fetching change history for LOS-${losId} (all departments)`);
        
        const history = await changeTracker.getDepartmentChangeHistory(losId, null);
        
        // Filter details if not requested
        const responseHistory = history.map(change => {
            const baseChange = {
                id: change.id,
                losId: change.losId,
                department: change.department,
                formType: change.formType,
                changeType: change.changeType,
                officer: change.officer,
                timestamp: change.timestamp,
                hash: change.hash
            };
            
            if (includeDetails === 'true') {
                baseChange.details = change.details;
                baseChange.context = change.context;
            }
            
            return baseChange;
        });
        
        res.json({
            success: true,
            losId,
            department: 'ALL',
            totalChanges: responseHistory.length,
            history: responseHistory,
            summary: {
                departments: [...new Set(history.map(h => h.department))],
                changeTypes: [...new Set(history.map(h => h.changeType))],
                officers: [...new Set(history.map(h => h.officer))],
                timeRange: history.length > 0 ? {
                    earliest: history[0].timestamp,
                    latest: history[history.length - 1].timestamp
                } : null
            }
        });
        
    } catch (error) {
        console.error('Error fetching change history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Verify integrity of department changes
 * GET /api/department-changes/verify/:losId/:department
 */
router.get('/verify/:losId/:department', async (req, res) => {
    try {
        const { losId, department } = req.params;
        
        console.log(`🔍 Verifying change integrity for LOS-${losId} (${department})`);
        
        const verification = await changeTracker.verifyDepartmentChanges(losId, department);
        
        res.json({
            success: true,
            losId,
            department,
            verification,
            message: verification.isValid 
                ? 'All changes verified successfully' 
                : `${verification.summary.invalidChanges} invalid changes detected`
        });
        
    } catch (error) {
        console.error('Error verifying changes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get department activity summary for a LOS
 * GET /api/department-changes/activity/:losId
 */
router.get('/activity/:losId', async (req, res) => {
    try {
        const { losId } = req.params;
        
        console.log(`📊 Fetching activity summary for LOS-${losId}`);
        
        const summary = await changeTracker.getDepartmentActivitySummary(losId);
        
        res.json({
            success: true,
            losId,
            departments: Object.values(summary),
            totals: {
                departments: Object.keys(summary).length,
                totalChanges: Object.values(summary).reduce((sum, dept) => sum + dept.totalChanges, 0),
                totalRiskScore: Object.values(summary).reduce((sum, dept) => sum + dept.riskScore, 0),
                uniqueOfficers: [...new Set(Object.values(summary).flatMap(dept => dept.officers))].length
            }
        });
        
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get specific change details
 * GET /api/department-changes/details/:changeId
 */
router.get('/details/:changeId', async (req, res) => {
    try {
        const { changeId } = req.params;
        
        console.log(`🔍 Fetching details for change ${changeId}`);
        
        // Search through all change chains for the specific change ID
        let foundChange = null;
        for (const [chainKey, changes] of changeTracker.changeChain.entries()) {
            const change = changes.find(c => c.id === changeId);
            if (change) {
                foundChange = change;
                break;
            }
        }
        
        if (!foundChange) {
            return res.status(404).json({
                success: false,
                error: `Change ${changeId} not found`
            });
        }
        
        res.json({
            success: true,
            change: foundChange
        });
        
    } catch (error) {
        console.error('Error fetching change details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get real-time change events (Server-Sent Events)
 * GET /api/department-changes/stream/:losId
 */
router.get('/stream/:losId', (req, res) => {
    const { losId } = req.params;
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    console.log(`📡 Starting change stream for LOS-${losId}`);
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ 
        type: 'connected', 
        losId, 
        timestamp: new Date().toISOString() 
    })}\n\n`);
    
    // Store this connection for future events
    const connectionId = Date.now().toString();
    if (!global.changeStreamConnections) {
        global.changeStreamConnections = new Map();
    }
    global.changeStreamConnections.set(connectionId, { res, losId });
    
    // Handle client disconnect
    req.on('close', () => {
        console.log(`📡 Change stream closed for LOS-${losId}`);
        global.changeStreamConnections.delete(connectionId);
    });
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    
    req.on('close', () => {
        clearInterval(keepAlive);
    });
});

/**
 * Broadcast change to all listening streams
 */
function broadcastChange(changeRecord) {
    if (!global.changeStreamConnections) return;
    
    for (const [connectionId, connection] of global.changeStreamConnections.entries()) {
        if (connection.losId === changeRecord.losId) {
            try {
                connection.res.write(`data: ${JSON.stringify({
                    type: 'change',
                    change: {
                        id: changeRecord.id,
                        department: changeRecord.department,
                        officer: changeRecord.officer,
                        timestamp: changeRecord.timestamp,
                        changeType: changeRecord.changeType,
                        fieldCount: changeRecord.fieldChanges.length
                    }
                })}\n\n`);
            } catch (error) {
                console.warn(`Failed to broadcast to connection ${connectionId}:`, error.message);
                global.changeStreamConnections.delete(connectionId);
            }
        }
    }
}

/**
 * Health check endpoint
 * GET /api/department-changes/health
 */
router.get('/health', (req, res) => {
    const totalChanges = Array.from(changeTracker.changeChain.values())
        .reduce((sum, changes) => sum + changes.length, 0);
    
    res.json({
        success: true,
        status: 'operational',
        service: 'Department Change Tracker',
        timestamp: new Date().toISOString(),
        stats: {
            totalChangeChains: changeTracker.changeChain.size,
            totalChanges,
            activeStreams: global.changeStreamConnections ? global.changeStreamConnections.size : 0
        },
        blockchain: {
            serviceUrl: changeTracker.blockchainServiceUrl,
            status: 'connected'
        }
    });
});

// Make broadcast function available for external use
router.broadcastChange = broadcastChange;

module.exports = router;
