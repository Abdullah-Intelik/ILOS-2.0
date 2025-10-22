const db = require('./db1');

async function createFunctions() {
  try {
    console.log('🔄 Creating PostgreSQL functions...');
    
    // Create update_spu_checklist function
    // IMPORTANT: Boolean semantics - TRUE = CLEARED/VERIFIED, FALSE = NOT CLEARED/HIT FOUND
    console.log('📝 Creating update_spu_checklist function...');
    await db.query(`
      CREATE OR REPLACE FUNCTION update_spu_checklist(
          p_los_id INTEGER,
          p_check_type VARCHAR(50),
          p_is_checked BOOLEAN,  -- TRUE = cleared/no hit, FALSE = not checked/hit found
          p_comment TEXT DEFAULT NULL
      ) RETURNS BOOLEAN AS $$
      BEGIN
          -- Boolean semantics: TRUE = CLEARED, FALSE = NOT CLEARED
          -- SPU Dashboard: Checked box = TRUE = Cleared/No hit found
          -- Decision Engine: Will invert to detect failures (see SPU.js)
          CASE p_check_type
              WHEN 'ecib' THEN
                  UPDATE ilos_applications 
                  SET spu_ecib_check = p_is_checked, spu_ecib_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'frmu' THEN
                  UPDATE ilos_applications 
                  SET spu_frmu_check = p_is_checked, spu_frmu_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'negative_list' THEN
                  UPDATE ilos_applications 
                  SET spu_negative_list_check = p_is_checked, spu_negative_list_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'pep_list' THEN
                  UPDATE ilos_applications 
                  SET spu_pep_list_check = p_is_checked, spu_pep_list_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'credit_card_30k' THEN
                  UPDATE ilos_applications 
                  SET spu_credit_card_30k_check = p_is_checked, spu_credit_card_30k_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'black_list' THEN
                  UPDATE ilos_applications 
                  SET spu_black_list_check = p_is_checked, spu_black_list_comment = p_comment
                  WHERE los_id = p_los_id;
              WHEN 'ctl' THEN
                  UPDATE ilos_applications 
                  SET spu_ctl_check = p_is_checked, spu_ctl_comment = p_comment
                  WHERE los_id = p_los_id;
              ELSE
                  RETURN FALSE;
          END CASE;
          
          -- Update checklist completion timestamp
          UPDATE ilos_applications 
          SET spu_checklist_completed_at = CURRENT_TIMESTAMP
          WHERE los_id = p_los_id;
          
          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ update_spu_checklist function created');
    
    // Create get_spu_checklist function
    console.log('📝 Creating get_spu_checklist function...');
    await db.query(`
      CREATE OR REPLACE FUNCTION get_spu_checklist(p_los_id INTEGER)
      RETURNS TABLE(
          check_type VARCHAR(50),
          is_checked BOOLEAN,
          comment_text TEXT
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 'ecib'::VARCHAR(50), spu_ecib_check, spu_ecib_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'frmu'::VARCHAR(50), spu_frmu_check, spu_frmu_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'negative_list'::VARCHAR(50), spu_negative_list_check, spu_negative_list_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'pep_list'::VARCHAR(50), spu_pep_list_check, spu_pep_list_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'credit_card_30k'::VARCHAR(50), spu_credit_card_30k_check, spu_credit_card_30k_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'black_list'::VARCHAR(50), spu_black_list_check, spu_black_list_comment FROM ilos_applications WHERE los_id = p_los_id
          UNION ALL
          SELECT 'ctl'::VARCHAR(50), spu_ctl_check, spu_ctl_comment FROM ilos_applications WHERE los_id = p_los_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_spu_checklist function created');
    
    // Create table to store per-document checklist status if it doesn't exist
    console.log('🗂️  Ensuring document_checklist_status table exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_checklist_status (
        id SERIAL PRIMARY KEY,
        los_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        is_verified BOOLEAN,
        comment_text TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (los_id, field_name)
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_doc_checklist_los ON document_checklist_status(los_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_doc_checklist_field ON document_checklist_status(field_name);`);
    console.log('✅ document_checklist_status table ready');

    // Create update_checklist function used by /api/applications/update-checklist
    console.log('📝 Creating update_checklist function...');
    await db.query(`
      CREATE OR REPLACE FUNCTION update_checklist(
          p_los_id INTEGER,
          p_field_name TEXT,
          p_is_verified BOOLEAN
      ) RETURNS BOOLEAN AS $$
      BEGIN
          INSERT INTO document_checklist_status(los_id, field_name, is_verified, updated_at)
          VALUES (p_los_id, p_field_name, p_is_verified, NOW())
          ON CONFLICT (los_id, field_name)
          DO UPDATE SET is_verified = EXCLUDED.is_verified, updated_at = NOW();
          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ update_checklist function created');

    // Create update_comment function used by /api/applications/update-comment
    console.log('📝 Creating update_comment function...');
    await db.query(`
      CREATE OR REPLACE FUNCTION update_comment(
          p_los_id INTEGER,
          p_field_name TEXT,
          p_comment TEXT
      ) RETURNS BOOLEAN AS $$
      BEGIN
          INSERT INTO document_checklist_status(los_id, field_name, comment_text, updated_at)
          VALUES (p_los_id, p_field_name, p_comment, NOW())
          ON CONFLICT (los_id, field_name)
          DO UPDATE SET comment_text = EXCLUDED.comment_text, updated_at = NOW();
          RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ update_comment function created');

    // Create fetch_comment_by_los_id to aggregate comments per LOS
    console.log('📝 Creating fetch_comment_by_los_id function...');
    await db.query(`
      CREATE OR REPLACE FUNCTION fetch_comment_by_los_id(
          p_los_id INTEGER
      ) RETURNS JSONB AS $$
      DECLARE
          result JSONB;
      BEGIN
          /*
            Aggregate comments from document_checklist_status for a given LOS
            into a simple key->value JSONB object: { field_name: comment_text }
          */
          SELECT COALESCE(jsonb_object_agg(field_name, comment_text) FILTER (WHERE comment_text IS NOT NULL), '{}'::jsonb)
          INTO result
          FROM document_checklist_status
          WHERE los_id = p_los_id;

          RETURN COALESCE(result, '{}'::jsonb);
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ fetch_comment_by_los_id function created');

    // Fix the typo in column name
    console.log('📝 Fixing typo in spu_negative_laist_comment...');
    try {
      await db.query(`
        ALTER TABLE ilos_applications 
        RENAME COLUMN spu_negative_laist_comment TO spu_negative_list_comment;
      `);
      console.log('✅ Column name fixed');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('ℹ️  Column might already be fixed or not exist');
      } else {
        console.log('❌ Error fixing column name:', error.message);
      }
    }
    
    console.log('🎉 All functions created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating functions:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createFunctions();