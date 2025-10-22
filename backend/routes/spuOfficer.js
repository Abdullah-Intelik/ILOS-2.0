const express = require('express');
const app = express();
const db = require('../db1');
const { createFormHashAfterSubmission } = require('./blockchain-hash');

// SPU Officer: Get all pending reviews
app.get('/officer/pending-reviews', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM spu_applications WHERE status = 'pending_review' ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending reviews:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SPU Officer: Approve an application
app.post('/officer/review/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { signer } = req.body;

  try {
    const result = await db.query("UPDATE spu_applications SET status = 'approved', verification_completed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create blockchain hash for SPU Officer approval
    try {
      await createFormHashAfterSubmission(
        result.rows[0].los_id || `SPU-${id}`,
        'SPU_OFFICER',
        'application_approval',
        {
          action: 'approve',
          applicationId: id,
          approvedBy: signer || 'spu_officer',
          approvalTimestamp: new Date().toISOString(),
          applicationData: result.rows[0]
        },
        signer || 'spu_officer'
      );
      console.log(`✅ Blockchain hash created for SPU Officer approval of application ${id}`);
    } catch (hashError) {
      console.error('⚠️ Failed to create blockchain hash for approval:', hashError.message);
      // Continue with the response even if hashing fails
    }

    res.json({ message: 'Application approved', application: result.rows[0] });
  } catch (err) {
    console.error('Error approving application:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SPU Officer: Reject an application
app.post('/officer/review/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { rejectionReason, signer } = req.body;

  try {
    const result = await db.query("UPDATE spu_applications SET status = 'rejected', review_notes = $1, verification_completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [rejectionReason, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create blockchain hash for SPU Officer rejection
    try {
      await createFormHashAfterSubmission(
        result.rows[0].los_id || `SPU-${id}`,
        'SPU_OFFICER',
        'application_rejection',
        {
          action: 'reject',
          applicationId: id,
          rejectedBy: signer || 'spu_officer',
          rejectionReason: rejectionReason,
          rejectionTimestamp: new Date().toISOString(),
          applicationData: result.rows[0]
        },
        signer || 'spu_officer'
      );
      console.log(`✅ Blockchain hash created for SPU Officer rejection of application ${id}`);
    } catch (hashError) {
      console.error('⚠️ Failed to create blockchain hash for rejection:', hashError.message);
      // Continue with the response even if hashing fails
    }

    res.json({ message: 'Application rejected', application: result.rows[0] });
  } catch (err) {
    console.error('Error rejecting application:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;

