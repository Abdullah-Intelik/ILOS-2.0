/**
 * PDF Generation Service
 * Generates application form PDFs
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate application form PDF
   */
  async generateApplicationPDF(losId, outputPath) {
    try {
      console.log(`📄 Generating PDF for LOS-${losId}...`);

      // Fetch application data
      const appData = await this.fetchApplicationData(losId);
      
      if (!appData) {
        throw new Error(`Application LOS-${losId} not found`);
      }

      // Create PDF
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);

        doc.pipe(writeStream);

        // Add content
        this.addHeader(doc, appData);
        this.addApplicantDetails(doc, appData);
        this.addLoanDetails(doc, appData);
        this.addEmploymentDetails(doc, appData);
        this.addReferences(doc, appData);
        this.addExposure(doc, appData);
        this.addDeclaration(doc, appData);
        this.addFooter(doc, appData);

        doc.end();

        writeStream.on('finish', () => {
          console.log(`✅ PDF generated successfully: ${outputPath}`);
          resolve(outputPath);
        });

        writeStream.on('error', (error) => {
          console.error(`❌ PDF generation error:`, error);
          reject(error);
        });
      });
    } catch (error) {
      console.error(`❌ Error generating PDF for LOS-${losId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch application data from database
   */
  async fetchApplicationData(losId) {
    try {
      // Get application details with ALL fields including exposure flags
      const appResult = await this.db.query(`
        SELECT 
          a.*,
          -- From parties table
          p.first_name, 
          p.last_name, 
          p.date_of_birth, 
          p.gender, 
          p.cnic,
          p.marital_status,
          p.mobile as customer_mobile,
          p.email as customer_email,
          p.residential_address,
          p.city,
          -- From party_details table
          pd.employment_type, 
          pd.employer_name, 
          pd.designation, 
          pd.employment_tenure_months, 
          pd.office_address, 
          pd.monthly_income,
          pd.bank_name, 
          pd.account_number,
          -- From products table
          pr.product_code, 
          pr.product_name,
          -- Exposure flags (from applications table)
          a.has_existing_cards,
          a.has_existing_loans,
          a.total_monthly_obligations
        FROM applications a
        LEFT JOIN parties p ON a.party_id = p.party_id
        LEFT JOIN party_details pd ON a.party_id = pd.party_id
        LEFT JOIN products pr ON a.product_id = pr.product_id
        WHERE a.los_id = $1
      `, [losId]);

      if (appResult.rows.length === 0) {
        return null;
      }

      const app = appResult.rows[0];

      // Get references
      const refsResult = await this.db.query(`
        SELECT * FROM application_references WHERE application_id = $1 ORDER BY reference_id
      `, [app.application_id]);

      app.references = refsResult.rows;

      // Exposure data is now in the applications table itself (from the SELECT query above)
      // No need to query application_exposure table
      // Just ensure the flags are properly set (they come from the main query)

      console.log(`📄 PDF Data fetched for LOS-${losId}:`, {
        name: `${app.first_name} ${app.last_name}`,
        cnic: app.cnic,
        mobile: app.customer_mobile,
        email: app.customer_email,
        address: app.residential_address,
        marital_status: app.marital_status,
        references: app.references.length,
        has_cards: app.has_existing_cards,
        has_loans: app.has_existing_loans
      });

      return app;
    } catch (error) {
      console.error('Error fetching application data:', error);
      throw error;
    }
  }

  /**
   * Add PDF header
   */
  addHeader(doc, data) {
    // ILOS BANK Header
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#1a5490')
      .text('ILOS BANK', 50, 50, { width: 250 })
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Intelligent Loan Origination System', 50, 85);
    
    // Application Header Box
    doc
      .roundedRect(350, 50, 200, 70, 5)
      .lineWidth(2)
      .strokeColor('#1a5490')
      .stroke();
    
    // Filled background for Application ID box
    doc
      .roundedRect(350, 50, 200, 25, 5)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('APPLICATION ID', 360, 58, { align: 'center', width: 180 })
      .fontSize(18)
      .fillColor('#1a5490')
      .text(`LOS-${data.los_id}`, 360, 85, { align: 'center', width: 180 })
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(new Date(data.created_at).toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'short', day: 'numeric' }), 360, 107, { align: 'center', width: 180 });
    
    // Main Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PERSONAL LOAN APPLICATION FORM', 50, 130, { align: 'center', width: 500 })
      .moveDown(0.3)
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#666666')
      .text(data.product_name || 'CashPlus Loan', { align: 'center' })
      .moveDown(0.8); // ✅ Reduced spacing
    
    doc.fillColor('#000000'); // Reset color
  }

  /**
   * Add applicant details section
   */
  addApplicantDetails(doc, data) {
    // ✅ Check if we have enough space
    if (doc.y > 600) {
      doc.addPage();
    }
    
    // Section Header with background
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SECTION 1: APPLICANT DETAILS', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    // Form-style fields in a table layout
    const details = [
      ['Full Name', `${data.first_name || ''} ${data.last_name || ''}`],
      ['CNIC', data.cnic || 'N/A'],
      ['Date of Birth', data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('en-PK') : 'N/A'],
      ['Gender', data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : 'N/A'],
      ['Marital Status', data.marital_status || 'N/A'],
      ['Mobile Number', data.customer_mobile || 'N/A'],
      ['Email', data.customer_email || 'N/A'],
      ['Residential Address', data.residential_address || 'N/A'],
    ];

    doc.fontSize(9).font('Helvetica');
    let yPos = doc.y;
    
    details.forEach(([label, value], index) => {
      // Alternate row shading
      if (index % 2 === 0) {
        doc.rect(50, yPos, 500, 20).fill('#f5f5f5');
      }
      
      // Label
      doc
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(label, 60, yPos + 6, { width: 180, continued: false });
      
      // Value
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(value, 250, yPos + 6, { width: 280 });
      
      yPos += 20;
    });
    
    doc.y = yPos + 10;
  }

  /**
   * Add loan details section
   */
  addLoanDetails(doc, data) {
    // ✅ Check if we have enough space
    if (doc.y > 600) {
      doc.addPage();
    }
    
    // Section Header
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SECTION 2: LOAN DETAILS', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    const details = [
      ['Product Type', data.product_name || data.product_type || 'N/A'],
      ['Requested Amount', `PKR ${(data.requested_amount || 0).toLocaleString()}`],
      ['Tenure', `${data.tenure_months || 0} months`],
      ['Purpose', data.purpose || 'N/A'],
      ['Monthly Installment', data.monthly_installment ? `PKR ${data.monthly_installment.toLocaleString()}` : 'N/A'],
    ];

    doc.fontSize(9).font('Helvetica');
    let yPos = doc.y;
    
    details.forEach(([label, value], index) => {
      // Alternate row shading
      if (index % 2 === 0) {
        doc.rect(50, yPos, 500, 20).fill('#f5f5f5');
      }
      
      // Label
      doc
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(label, 60, yPos + 6, { width: 180, continued: false });
      
      // Value
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(value, 250, yPos + 6, { width: 280 });
      
      yPos += 20;
    });
    
    doc.y = yPos + 10;
  }

  /**
   * Add employment details section
   */
  addEmploymentDetails(doc, data) {
    // ✅ Check if we have enough space
    if (doc.y > 600) {
      doc.addPage();
    }
    
    // Section Header
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SECTION 3: EMPLOYMENT DETAILS', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    const details = [
      ['Employment Type', data.employment_type || 'N/A'],
      ['Employer Name', data.employer_name || 'N/A'],
      ['Designation', data.designation || 'N/A'],
      ['Employment Tenure', data.employment_tenure_months ? `${data.employment_tenure_months} months` : 'N/A'],
      ['Office Address', data.office_address || 'N/A'],
      ['Monthly Income', data.monthly_income ? `PKR ${data.monthly_income.toLocaleString()}` : 'N/A'],
    ];

    doc.fontSize(9).font('Helvetica');
    let yPos = doc.y;
    
    details.forEach(([label, value], index) => {
      // Alternate row shading
      if (index % 2 === 0) {
        doc.rect(50, yPos, 500, 20).fill('#f5f5f5');
      }
      
      // Label
      doc
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(label, 60, yPos + 6, { width: 180, continued: false });
      
      // Value
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(value, 250, yPos + 6, { width: 280 });
      
      yPos += 20;
    });
    
    doc.y = yPos + 10;
  }

  /**
   * Add references section
   */
  addReferences(doc, data) {
    if (!data.references || data.references.length === 0) {
      return;
    }

    // ✅ Check if we have enough space
    if (doc.y > 600) {
      doc.addPage();
    }

    // Section Header
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SECTION 4: REFERENCES', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    data.references.forEach((ref, index) => {
      // Reference sub-header
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1a5490')
        .text(`Reference ${index + 1}`, 50, doc.y)
        .fillColor('#000000')
        .moveDown(0.5);

      const refDetails = [
        ['Name', ref.full_name || 'N/A'],
        ['Relationship', ref.relationship || 'N/A'],
        ['Mobile', ref.mobile_number || 'N/A'],
        ['Address', ref.address || 'N/A'],
      ];

      doc.fontSize(9).font('Helvetica');
      let yPos = doc.y;
      
      refDetails.forEach(([label, value], idx) => {
        // Alternate row shading
        if (idx % 2 === 0) {
          doc.rect(50, yPos, 500, 18).fill('#f5f5f5');
        }
        
        // Label
        doc
          .font('Helvetica-Bold')
          .fillColor('#333333')
          .text(label, 60, yPos + 5, { width: 180, continued: false });
        
        // Value
        doc
          .font('Helvetica')
          .fillColor('#000000')
          .text(value, 250, yPos + 5, { width: 280 });
        
        yPos += 18;
      });
      
      doc.y = yPos + 8;
    });

    doc.moveDown(0.5);
  }

  /**
   * Add exposure section
   */
  addExposure(doc, data) {
    // ✅ Check if we have enough space (at least 150px for header + content)
    if (doc.y > 650) {
      doc.addPage();
    }
    
    // Section Header
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('SECTION 5: CREDIT EXPOSURE', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    const exposureDetails = [
      ['Existing Credit Cards', data.has_existing_cards ? 'Yes' : 'No'],
      ['Existing Personal Loans', data.has_existing_loans ? 'Yes' : 'No'],
      ['Total Monthly Obligations', data.total_monthly_obligations ? `PKR ${data.total_monthly_obligations.toLocaleString()}` : 'N/A'],
    ];

    doc.fontSize(9).font('Helvetica');
    let yPos = doc.y;
    
    exposureDetails.forEach(([label, value], index) => {
      // Alternate row shading
      if (index % 2 === 0) {
        doc.rect(50, yPos, 500, 20).fill('#f5f5f5');
      }
      
      // Label
      doc
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(label, 60, yPos + 6, { width: 180, continued: false });
      
      // Value
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(value, 250, yPos + 6, { width: 280 });
      
      yPos += 20;
    });
    
    doc.y = yPos + 10;
  }

  /**
   * Add declaration section
   */
  addDeclaration(doc, data) {
    // ✅ Check if we have enough space (need more space for declaration text)
    if (doc.y > 650) {
      doc.addPage();
    }
    
    // Section Header
    const currentY = doc.y;
    doc
      .roundedRect(50, currentY, 500, 28, 4)
      .fillAndStroke('#1a5490', '#1a5490');
    
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('DECLARATION', 60, currentY + 8)
      .fillColor('#000000')
      .moveDown(1.2); // ✅ Reduced spacing

    // Declaration box with light background
    const declY = doc.y;
    doc
      .roundedRect(50, declY, 500, 70, 3)
      .fill('#fffef0');

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text(
        'I hereby declare that the information provided in this application is true and correct to the best of my knowledge. ' +
        'I authorize ILOS BANK to verify the information provided and to obtain credit reports from credit bureaus. ' +
        'I understand that any false information may result in rejection of my application or termination of services.',
        60, declY + 10, { width: 480, align: 'justify' }
      )
      .moveDown(2);

    // Signature line
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Applicant Signature: ___________________________', 60, doc.y + 20)
      .text(`Date: ${new Date().toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'long', day: 'numeric' })}`, 380, doc.y - 12);

    doc.moveDown(1);
  }

  /**
   * Add footer
   */
  addFooter(doc, data) {
    const bottomMargin = 60;
    const footerY = doc.page.height - bottomMargin;
    
    // Horizontal line above footer
    doc
      .moveTo(50, footerY - 10)
      .lineTo(550, footerY - 10)
      .strokeColor('#1a5490')
      .lineWidth(1)
      .stroke();
    
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#1a5490')
      .text('ILOS BANK', 50, footerY, { align: 'center', width: 500 })
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'This is a system-generated document. For queries, please contact ILOS BANK.',
        50,
        footerY + 12,
        { align: 'center', width: 500 }
      )
      .text(
        `Generated on: ${new Date().toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        50,
        footerY + 22,
        { align: 'center', width: 500 }
      );
  }
}

module.exports = { PDFService };

