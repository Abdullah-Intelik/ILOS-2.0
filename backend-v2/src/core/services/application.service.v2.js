/**
 * Application Service V2.0
 * Enhanced for full product-party integration
 */

const { ApplicationRepository } = require('../../infrastructure/repositories');
const { ProductService } = require('./product.service');
const { PartyService } = require('./party.service');
const { AutomationService } = require('./automation.service');
const { PDFService } = require('./pdf.service');
const path = require('path');
const fs = require('fs');

class ApplicationServiceV2 {
  constructor(db) {
    this.db = db;
    this.appRepo = new ApplicationRepository(db);
    this.productService = new ProductService(db);
    this.partyService = new PartyService(db);
    this.automationService = new AutomationService(db);
    this.pdfService = new PDFService(db);
  }

  /**
   * Create new application with full data handling
   */
  async createApplication(data, userId) {
    const client = await this.db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // ✅ CHECK IF THIS IS A MOBILE SUBMISSION COMPLETION (UPDATE instead of INSERT)
      if (data.mobileSubmissionLosId) {
        console.log(`📱 Mobile submission completion detected - updating LOS-${data.mobileSubmissionLosId}`);
        return await this.updateMobileSubmission(data, userId, client);
      }
      
      console.log(`📤 Creating application for product: ${data.product_code}`);
      console.log(`🔍 RECEIVED DATA IN BACKEND:`, {
        product_code: data.product_code,
        requested_amount: data.requested_amount,
        tenure_months: data.tenure_months,
        party_data: data.party_data ? 'present' : 'missing',
        product_details: data.product_details ? 'present' : 'missing'
      });

      // 1. Validate and fetch product
      const validation = await this.productService.validateProductEligibility(
        data.product_code,
        data.requested_amount,
        data.party_data?.customer_type || 'NTB'
      );

      if (!validation.isValid) {
        throw new Error(`Product validation failed: ${validation.errors.join(', ')}`);
      }

      const product = validation.product;

      // 2. Get or create party (customer)
      let partyId = data.party_id;
      let isExistingParty = false; // Track if party already existed
      
      if (!partyId && data.party_data) {
        // Check if party already exists
        const existingParty = await this.partyService.findByCnic(data.party_data.cnic);
        
        if (existingParty) {
          console.log(`✅ Found existing party: ${existingParty.party_id} (CNIC: ${data.party_data.cnic})`);
          partyId = existingParty.party_id;
          isExistingParty = true; // Mark as existing
          
          // Update party data with latest information
          console.log(`📝 Updating party ${partyId} with latest data`);
          await this.partyService.updateParty(partyId, data.party_data);
        } else {
          console.log(`📝 Creating new party for CNIC: ${data.party_data.cnic}`);
          const party = await this.partyService.createParty(data.party_data, client);
          partyId = party.party_id;
          isExistingParty = false; // Mark as new
        }
      } else if (partyId) {
        // Party ID provided directly (likely existing party)
        isExistingParty = true;
      }

      if (!partyId) {
        throw new Error('Party ID is required or party_data must be provided');
      }

      // 3. Store or update party_details (employment, banking)
      if (data.party_details) {
        console.log(`📝 Storing party details for party: ${partyId}`);
        console.log(`   Monthly Income: ${data.party_details.monthly_income}`);
        console.log(`   Employer: ${data.party_details.employer_name}`);
        console.log(`   Employment Type: ${data.party_details.employment_type}`);
        await this.storePartyDetails(partyId, data.party_details, client);
        console.log(`✅ Party details ${isExistingParty ? 'UPDATED' : 'CREATED'} for party ${partyId}`);
      } else {
        console.log(`⚠️  No party_details provided - skipping employment/banking update`);
      }

      // 4. Create main application record  
      // ✅ FIX: Include purpose, application_type, and automation flags
      const appResult = await client.query(`
        INSERT INTO applications (
          party_id, product_id, product_type, application_type, purpose, 
          requested_amount, tenure_months, current_stage, status, 
          source, submitted_by, is_automated, automation_eligible
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PB', 'submitted', $8, $9, false, true)
        RETURNING *
      `, [
        partyId,
        product.product_id,
        product.product_type,
        data.application_type || null,
        data.purpose || null, // ✅ Now saving purpose!
        data.requested_amount,
        data.tenure_months,
        data.source || 'web',
        userId
      ]);

      const application = appResult.rows[0];
      const applicationId = application.application_id;
      const losId = application.los_id;
      console.log(`✅ Application created: LOS-${losId}`);

      // 5. Create product-specific record
      await this.createProductSpecificRecord(
        applicationId,
        losId,
        product.product_type,
        data.product_details || {},
        client
      );

      // 6. Store references if provided
      if (data.references && data.references.length > 0) {
        console.log(`📝 Storing ${data.references.length} reference(s)`);
        await this.storeReferences(applicationId, losId, data.references, client);
      }

      // 7. Store exposure data if provided
      if (data.exposure) {
        console.log(`📝 Storing exposure data`);
        await this.storeExposure(application.application_id, data.exposure, client);
      }

      // 8. Store documents if provided (copy from temp folder to application folder)
      if (data.documents || data.party_data?.cnic) {
        console.log(`📝 Processing and copying document files`);
        await this.storeDocuments(
          application.application_id, 
          data.documents, 
          client, 
          application.los_id, 
          application.product_type,
          data.party_data?.cnic // Pass CNIC to find temp folder
        );
      }

      await client.query('COMMIT');
      console.log(`✅ Application LOS-${application.los_id} created successfully with all details`);

      // ✅ Determine application type for conditional PDF generation
      const INSTANT_LOAN_MAX_AMOUNT = 750000; // 7.5 Lac
      const isMobileSubmission = application.source === 'mobile' || application.source === 'mobile_app';
      const isWebSubmission = application.source === 'web';
      const isInstantLoan = isMobileSubmission && 
                            application.product_type === 'instant_loan' && // ✅ CRITICAL: Check product type
                            application.requested_amount <= INSTANT_LOAN_MAX_AMOUNT && 
                            (data.party_data?.customer_type === 'ETB');
      
      // ✅ Only generate PDF for:
      // 1. Instant Loans (complete data, fully automated)
      // 2. Web submissions (PB already completed the form)
      // For regular mobile loans → PDF will be generated when PB completes the form
      const shouldGeneratePDF = isInstantLoan || isWebSubmission;
      
      if (shouldGeneratePDF) {
        console.log(`📄 Generating PDF for ${isInstantLoan ? 'Instant Loan' : 'Web Submission'}...`);
        
        // ✅ Generate PDF after transaction commits - save directly to document storage
        setImmediate(async () => {
          try {
            console.log(`\n📄 Generating application PDF for LOS-${application.los_id}...`);
            
            // Map product type to folder name
            const productTypeMap = {
              'personal_loan': 'cashplus',
              'instant_loan': 'cashplus',
              'cashplus': 'cashplus',
              'auto_loan': 'autoloan',
              'autoloan': 'autoloan',
              'commercial_vehicle': 'commercialvehicle',
              'smeasaan': 'smeasaan',
              'ameendrive': 'ameendrive'
            };
            
            const productFolder = productTypeMap[application.product_type?.toLowerCase()] || 'cashplus';
            const documentsBaseDir = path.join(__dirname, '../../../ilos_loan_application_documents');
            const applicationDocDir = path.join(documentsBaseDir, productFolder, `los-${application.los_id}`);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(applicationDocDir)) {
              fs.mkdirSync(applicationDocDir, { recursive: true });
              console.log(`📁 Created documents directory: ${applicationDocDir}`);
            }
            
            // Generate PDF directly in the same location as other documents
            const pdfPath = path.join(applicationDocDir, `${application.los_id}-Application.pdf`);
            await this.pdfService.generateApplicationPDF(application.los_id, pdfPath);
            
            console.log(`✅ Application PDF generated and saved: ${pdfPath}`);
            console.log(`📄 PDF will appear alongside other documents (CNIC, eCIB, Salary, etc.)`)
          } catch (error) {
            console.error(`⚠️  PDF generation failed for LOS-${application.los_id}:`, error.message);
            // Don't fail the application creation if PDF generation fails
          }
        });
      } else if (isMobileSubmission && !isInstantLoan) {
        console.log(`📱 Regular mobile loan - PDF will be generated after PB completes the form`);
      }
      
      // ✅ Trigger automated workflow for:
      // 1. INSTANT LOANS (full automation to disburse)
      // 2. REGULAR WEB SUBMISSIONS (SPU + EAVMU assignment)
      if (application.automation_eligible && (isInstantLoan || isWebSubmission)) {
        if (isInstantLoan) {
          console.log(`\n⚡ INSTANT LOAN detected - triggering full automation (end-to-end)...`);
        } else if (isWebSubmission) {
          console.log(`\n🌐 WEB SUBMISSION detected - triggering workflow automation (SPU + EAVMU assignment)...`);
        }
        
        // Run automation asynchronously (don't wait for it)
        setImmediate(async () => {
          try {
            const automationResult = await this.automationService.processNewApplication(
              application.los_id,
              {
                application_id: application.application_id, // ✅ PRIMARY KEY for SPU checks
                party_id: application.party_id, // ✅ PARTY ID for SPU checks
                cnic: data.party_data?.cnic,
                product_type: application.product_type,
                requested_amount: application.requested_amount,
                customer_type: data.party_data?.customer_type || 'NTB',
                source: application.source // ✅ Pass source to detect mobile vs web
              }
            );
            
            console.log(`\n✅ Automated workflow result for LOS-${application.los_id}:`, {
              success: automationResult.success,
              stage: automationResult.stage,
              status: automationResult.status
            });
            
          } catch (error) {
            console.error(`\n❌ Automated workflow failed for LOS-${application.los_id}:`, error.message);
            // Application still exists, just not automated
          }
        });
      } else if (isMobileSubmission && !isInstantLoan) {
        console.log(`\n📱 REGULAR MOBILE LOAN - staying in PB for manual review`);
        console.log(`   Customer Type: ${data.party_data?.customer_type || 'NTB'}`);
        console.log(`   Amount: PKR ${application.requested_amount}`);
        console.log(`   Flow: PB → SPU → EAVMU → CIU → Disburse (same as web, but PB completes first)`);
      } else {
        console.log(`⏸️  Application in PB - manual processing required`);
      }

      return application;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating application:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update existing mobile submission with PB-completed data
   */
  async updateMobileSubmission(data, userId, client) {
    try {
      const losId = data.mobileSubmissionLosId;
      console.log(`\n📱 ========== UPDATING MOBILE SUBMISSION: LOS-${losId} ==========`);
      
      // 1. Get existing application
      const existingApp = await client.query(
        'SELECT * FROM applications WHERE los_id = $1',
        [losId]
      );
      
      if (existingApp.rows.length === 0) {
        throw new Error(`Application LOS-${losId} not found`);
      }
      
      const application = existingApp.rows[0];
      const partyId = application.party_id;
      
      console.log(`✅ Found existing application: LOS-${losId}, Party ID: ${partyId}`);
      
      // 2. Update party data if provided
      if (data.party_data) {
        console.log(`📝 Updating party ${partyId} with PB-completed data`);
        await this.partyService.updateParty(partyId, data.party_data);
      }
      
      // 3. Update party_details if provided
      if (data.party_details) {
        console.log(`📝 Updating party details for party ${partyId}`);
        await this.storePartyDetails(partyId, data.party_details, client);
      }
      
      // 4. Update application record with additional data
      console.log(`📝 Updating application LOS-${losId} with PB data`);
      await client.query(`
        UPDATE applications 
        SET 
          purpose = COALESCE($1, purpose),
          requested_amount = COALESCE($2, requested_amount),
          tenure_months = COALESCE($3, tenure_months),
          submitted_by = $4,
          updated_at = NOW()
        WHERE los_id = $5
      `, [
        data.purpose || null,
        data.requested_amount || null,
        data.tenure_months || null,
        userId,
        losId
      ]);
      
      // 5. Update product-specific record (don't create, it already exists)
      if (data.product_details) {
        console.log(`📝 Updating product-specific record for LOS-${losId}`);
        const productType = application.product_type;
        
        if (productType === 'personal_loan' || productType === 'instant_loan') {
          await client.query(`
            UPDATE product_personal_loan 
            SET 
              loan_type = COALESCE($1, loan_type),
              min_acceptable_amount = COALESCE($2, min_acceptable_amount),
              max_affordable_installment = COALESCE($3, max_affordable_installment)
            WHERE application_id = $4
          `, [
            data.product_details.loan_type || null,
            data.product_details.min_acceptable_amount || null,
            data.product_details.max_affordable_installment || null,
            application.application_id
          ]);
          console.log(`✅ Product_personal_loan record updated`);
        }
        // Add other product types here if needed
      }
      
      // 6. Update references if provided
      if (data.references && data.references.length > 0) {
        console.log(`📝 Updating ${data.references.length} reference(s)`);
        // Delete old references and insert new ones
        await client.query('DELETE FROM application_references WHERE application_id = $1', [application.application_id]);
        await this.storeReferences(application.application_id, losId, data.references, client);
      }
      
      // 7. Update exposure data if provided
      if (data.exposure) {
        console.log(`📝 Updating exposure data`);
        await this.storeExposure(application.application_id, data.exposure, client);
      }
      
      await client.query('COMMIT');
      // DON'T release here - let the parent createApplication's finally block handle it
      
      console.log(`✅ Mobile submission LOS-${losId} updated successfully!`);
      
      // Get updated application for workflow
      const updatedAppResult = await this.db.query(
        'SELECT * FROM applications WHERE los_id = $1',
        [losId]
      );
      const updatedApplication = updatedAppResult.rows[0];
      
      // ✅ Generate PDF now that PB has completed the form with full data
      console.log(`📄 Generating PDF for completed mobile submission LOS-${losId}...`);
      
      setImmediate(async () => {
        try {
          const path = require('path');
          const fs = require('fs');
          
          // Map product type to folder name
          const productTypeMap = {
            'personal_loan': 'cashplus',
            'instant_loan': 'cashplus',
            'cashplus': 'cashplus',
            'auto_loan': 'autoloan',
            'autoloan': 'autoloan',
            'commercial_vehicle': 'commercialvehicle',
            'smeasaan': 'smeasaan',
            'ameendrive': 'ameendrive'
          };
          
          const productFolder = productTypeMap[updatedApplication.product_type?.toLowerCase()] || 'cashplus';
          const documentsBaseDir = path.join(__dirname, '../../../ilos_loan_application_documents');
          const applicationDocDir = path.join(documentsBaseDir, productFolder, `los-${losId}`);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(applicationDocDir)) {
            fs.mkdirSync(applicationDocDir, { recursive: true });
            console.log(`📁 Created documents directory: ${applicationDocDir}`);
          }
          
          // Generate PDF with complete data from PB
          const pdfPath = path.join(applicationDocDir, `${losId}-Application.pdf`);
          await this.pdfService.generateApplicationPDF(losId, pdfPath);
          
          console.log(`✅ Application PDF generated and saved: ${pdfPath}`);
        } catch (error) {
          console.error(`⚠️  PDF generation failed for LOS-${losId}:`, error.message);
        }
      });
      
      // ✅ NOW TRIGGER WORKFLOW AUTOMATION (reuse existing automation service)
      console.log(`\n🔄 Starting automated workflow for completed mobile submission LOS-${losId}...`);
      
      // Trigger workflow in background (don't wait for it) - same as web submissions
      setImmediate(async () => {
        try {
          console.log(`\n🤖 ========== AUTOMATED WORKFLOW: LOS-${losId} ==========`);
          
          const automationResult = await this.automationService.processNewApplication(
            updatedApplication.los_id,
            {
              application_id: updatedApplication.application_id,
              party_id: updatedApplication.party_id,
              cnic: data.party_data?.cnic,
              product_type: updatedApplication.product_type,
              requested_amount: updatedApplication.requested_amount,
              customer_type: data.party_data?.customer_type || 'ETB',
              source: 'web' // Treat as web submission for workflow purposes
            }
          );
          
          console.log(`✅ Automated workflow result for LOS-${losId}:`, {
            success: automationResult.success,
            stage: automationResult.stage,
            status: automationResult.status
          });
          console.log(`========================================================\n`);
        } catch (workflowError) {
          console.error(`\n❌ Automated workflow failed for LOS-${losId}:`, workflowError.message);
        }
      });
      
      console.log(`========================================================\n`);
      
      return updatedApplication;
      
    } catch (error) {
      await client.query('ROLLBACK');
      // DON'T release here either - let the parent finally block handle it
      console.error('❌ Error updating mobile submission:', error);
      throw error;
    }
  }

  /**
   * Store party details (employment, banking)
   */
  async storePartyDetails(partyId, details, client) {
    console.log(`💾 Executing party_details UPSERT for party ${partyId}:`, {
      monthly_income: details.monthly_income,
      employer_name: details.employer_name,
      employment_type: details.employment_type,
      bank_name: details.bank_name || '(not provided - will preserve existing)',
      account_number: details.account_number || '(not provided - will preserve existing)'
    });
    
    // ✅ FIX: Only update banking details if provided (don't overwrite with NULL)
    const result = await client.query(`
      INSERT INTO party_details (
        party_id, employment_type, employer_name, designation,
        employment_tenure_months, office_address, monthly_income,
        bank_name, account_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (party_id) DO UPDATE SET
        employment_type = EXCLUDED.employment_type,
        employer_name = EXCLUDED.employer_name,
        designation = EXCLUDED.designation,
        employment_tenure_months = EXCLUDED.employment_tenure_months,
        office_address = EXCLUDED.office_address,
        monthly_income = EXCLUDED.monthly_income,
        bank_name = COALESCE(EXCLUDED.bank_name, party_details.bank_name),
        account_number = COALESCE(EXCLUDED.account_number, party_details.account_number),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      partyId,
      details.employment_type,
      details.employer_name,
      details.designation,
      details.employment_tenure_months,
      details.office_address,
      details.monthly_income,
      details.bank_name,
      details.account_number
    ]);

    console.log(`✅ Party details saved. Returned monthly_income: ${result.rows[0].monthly_income}`);
    
    return result.rows[0];
  }

  /**
   * Create product-specific record based on product type
   */
  async createProductSpecificRecord(applicationId, losId, productType, details, client) {
    switch (productType) {
      case 'personal_loan':
      case 'instant_loan':
        await client.query(`
          INSERT INTO product_personal_loan (
            application_id, los_id, loan_type,
            min_acceptable_amount, max_affordable_installment
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          applicationId,
          losId,
          details.loan_type || 'Normal',
          details.min_acceptable_amount || null,
          details.max_affordable_installment || null
        ]);
        console.log(`✅ Product_personal_loan record created`);
        break;

      case 'auto_loan':
        await client.query(`
          INSERT INTO product_auto_loan (
            application_id, los_id, vehicle_make, vehicle_model,
            year_of_manufacture, variant, engine_capacity,
            vehicle_price, down_payment, financing_amount,
            desired_tenure_years, has_guarantor, guarantor_name,
            guarantor_cnic, guarantor_relationship
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          applicationId,
          losId,
          details.vehicle_make,
          details.vehicle_model,
          details.year_of_manufacture,
          details.variant,
          details.engine_capacity,
          details.vehicle_price,
          details.down_payment,
          details.financing_amount,
          details.desired_tenure_years,
          details.has_guarantor || false,
          details.guarantor_name,
          details.guarantor_cnic,
          details.guarantor_relationship
        ]);
        console.log(`✅ Product_auto_loan record created`);
        break;

      case 'credit_card':
        await client.query(`
          INSERT INTO product_credit_card (
            application_id, los_id, preferred_card_type,
            requested_credit_limit, existing_cards_count,
            residential_ownership, duration_at_address_months
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          applicationId,
          losId,
          details.preferred_card_type,
          details.requested_credit_limit,
          details.existing_cards_count || 0,
          details.residential_ownership,
          details.duration_at_address_months
        ]);
        console.log(`✅ Product_credit_card record created`);
        break;

      case 'islamic_finance':
        await client.query(`
          INSERT INTO product_islamic_finance (
            application_id, los_id, finance_type, declared_purpose,
            financing_mode, shariah_compliance_declaration,
            vehicle_use_declaration
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          applicationId,
          losId,
          details.finance_type,
          details.declared_purpose,
          details.financing_mode,
          details.shariah_compliance_declaration || false,
          details.vehicle_use_declaration
        ]);
        console.log(`✅ Product_islamic_finance record created`);
        break;

      default:
        console.warn(`⚠️ Unknown product type: ${productType}, skipping product-specific record`);
    }
  }

  /**
   * Store references
   */
  async storeReferences(applicationId, losId, references, client) {
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      await client.query(`
        INSERT INTO application_references (
          application_id, los_id, reference_number, full_name, relationship, mobile, address, cnic
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        applicationId,
        losId,
        i + 1, // reference_number (1 or 2)
        ref.name,
        ref.relationship,
        ref.mobile,
        ref.address || '',
        ref.cnic || null
      ]);
    }
  }

  /**
   * Store exposure data
   * Note: application_exposure table expects individual exposure records, not boolean flags
   */
  async storeExposure(applicationId, exposure, client) {
    try {
      // Update applications table with exposure flags
      await client.query(`
        UPDATE applications 
        SET 
          has_existing_cards = $1,
          has_existing_loans = $2,
          total_monthly_obligations = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE application_id = $4
      `, [
        exposure.has_existing_cards || false,
        exposure.has_existing_loans || false,
        exposure.total_monthly_obligations || 0,
        applicationId
      ]);
      
      console.log(`✅ Exposure data stored: Cards=${exposure.has_existing_cards}, Loans=${exposure.has_existing_loans}`);
    } catch (error) {
      console.error('⚠️  Error storing exposure data:', error.message);
      // Don't throw - let application creation continue
    }
  }

  /**
   * Store document metadata and copy files to application folder
   * Looks for documents in temp-{cnic} folder and copies them to los-{id} folder
   */
  async storeDocuments(applicationId, documents, client, losId, productType, cnic) {
    try {
      console.log(`📝 Processing documents for application ${applicationId} (LOS-${losId})...`);
      
      const fs = require('fs');
      const path = require('path');
      
      // Map product type to folder name
      const productTypeMap = {
        'personal_loan': 'cashplus',
        'cashplus': 'cashplus',
        'instant_loan': 'cashplus',
        'auto_loan': 'autoloan',
        'autoloan': 'autoloan',
        'smeasaan': 'smeasaan',
        'ameendrive': 'ameendrive'
      };
      
      const productFolder = productTypeMap[productType?.toLowerCase()] || 'cashplus';
      const documentsBaseDir = path.join(__dirname, '../../../ilos_loan_application_documents');
      const applicationDocDir = path.join(documentsBaseDir, productFolder, `los-${losId}`);
      const tempDocDir = path.join(documentsBaseDir, productFolder, `los-temp-${cnic}`); // Match Document Server's folder naming
      
      // Create final directory if it doesn't exist
      if (!fs.existsSync(applicationDocDir)) {
        fs.mkdirSync(applicationDocDir, { recursive: true });
        console.log(`   📁 Created directory: ${applicationDocDir}`);
      }
      
      // Check if documents object has serverPath (mobile app submission)
      if (documents && Object.keys(documents).length > 0) {
        console.log('   📱 Processing documents from mobile app submission...');
        
        for (const [docType, docData] of Object.entries(documents)) {
          if (!docData || !docData.serverPath) {
            console.log(`   ⏭️  Skipping ${docType}: no serverPath`);
            continue;
          }
          
          try {
            const sourcePath = path.join(__dirname, '../../../', docData.serverPath);
            const fileName = path.basename(docData.serverPath);
            const destPath = path.join(applicationDocDir, fileName);
            
            // Copy file from temporary location to application folder
            if (fs.existsSync(sourcePath)) {
              fs.copyFileSync(sourcePath, destPath);
              console.log(`   ✅ Copied ${docType}: ${fileName}`);
            } else {
              console.log(`   ⚠️  Source file not found for ${docType}: ${sourcePath}`);
            }
          } catch (error) {
            console.error(`   ❌ Error copying ${docType}:`, error.message);
          }
        }
      }
      
      // Also check los-temp-{cnic} folder for any documents uploaded from mobile app
      if (cnic && fs.existsSync(tempDocDir)) {
        console.log(`   📱 Found temporary document folder: los-temp-${cnic}`);
        const tempFiles = fs.readdirSync(tempDocDir);
        
        // Map mobile app file naming to standard naming convention
        const fileNameMap = {
          [`cnic_${cnic}.jpg`]: `${losId}-CNIC.jpg`,
          [`cnic_${cnic}.jpeg`]: `${losId}-CNIC.jpeg`,
          [`cnic_${cnic}.png`]: `${losId}-CNIC.png`,
          [`salarySlip_${cnic}.jpg`]: `${losId}-Salary Slip.jpg`,
          [`salarySlip_${cnic}.jpeg`]: `${losId}-Salary Slip.jpeg`,
          [`salarySlip_${cnic}.png`]: `${losId}-Salary Slip.png`,
          [`salarySlip_${cnic}.pdf`]: `${losId}-Salary Slip.pdf`,
          [`ecib_${cnic}.pdf`]: `${losId}-eCIB.pdf`,
        };
        
        for (const file of tempFiles) {
          try {
            // Skip OCR JSON metadata files - only copy actual documents
            if (file.endsWith('.json')) {
              console.log(`   ⏭️  Skipping metadata file: ${file}`);
              continue;
            }
            
            const sourcePath = path.join(tempDocDir, file);
            // Use mapped name if available, otherwise keep original
            const standardName = fileNameMap[file] || file;
            const destPath = path.join(applicationDocDir, standardName);
            
            if (!fs.existsSync(destPath)) {
              fs.copyFileSync(sourcePath, destPath);
              console.log(`   ✅ Moved from temp: ${file} → ${standardName}`);
            } else {
              console.log(`   ⏭️  File already exists: ${standardName}`);
            }
          } catch (error) {
            console.error(`   ❌ Error moving ${file}:`, error.message);
          }
        }
        
        // Optionally, delete the temp folder after copying
        try {
          fs.rmSync(tempDocDir, { recursive: true, force: true });
          console.log(`   🗑️  Cleaned up temporary folder: temp-${cnic}`);
        } catch (error) {
          console.error(`   ⚠️  Could not delete temp folder:`, error.message);
        }
      }
      
      console.log(`✅ Document processing completed for LOS-${losId}`);
    } catch (error) {
      console.error('❌ Error in storeDocuments:', error);
      // Don't throw - document storage is not critical for application creation
    }
  }

  // Delegate other methods to original ApplicationService methods
  async getByLosId(losId) {
    return this.appRepo.findByLosId(losId);
  }

  async getApplicationSummary(losId) {
    return this.appRepo.getApplicationSummary(losId);
  }

  async updateStatus(losId, newStatus, userId, comments = null) {
    return this.appRepo.updateStatus(losId, newStatus, userId, comments);
  }

  async submitApplication(losId, userId) {
    const application = await this.appRepo.findByLosId(losId);
    
    if (!application) {
      throw new Error(`Application ${losId} not found`);
    }

    if (application.current_status !== 'draft') {
      throw new Error(`Application ${losId} is already submitted`);
    }

    const updated = await this.appRepo.updateStatus(
      losId,
      'submitted',
      userId,
      'Application submitted'
    );

    console.log(`✅ Application LOS-${losId} submitted`);
    return updated;
  }

  async getByParty(partyId, options = {}) {
    return this.appRepo.findByParty(partyId, options);
  }

  async getByStatus(status, options = {}) {
    return this.appRepo.findByStatus(status, options);
  }

  async getByDepartment(department, options = {}) {
    return this.appRepo.findByDepartment(department, options);
  }

  async getAssignedApplications(userId, options = {}) {
    return this.appRepo.findByAssignedUser(userId, options);
  }

  async getDashboardMetrics() {
    return this.appRepo.getDashboardMetrics();
  }
}

module.exports = { ApplicationServiceV2 };

