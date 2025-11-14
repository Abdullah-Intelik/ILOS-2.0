/**
 * Decision Engine Wrapper
 * Wraps the CreditCardDecisionEngine and provides a clean interface
 */

const CreditCardDecisionEngine = require('./DecisionEngine');

class DecisionEngineWrapper {
  constructor() {
    this.engine = new CreditCardDecisionEngine();
  }

  /**
   * Calculate complete decision for an application
   * @param {Object} app - Application data
   * @returns {Promise<Object>} Decision result with all modules
   */
  async calculateDecision(app) {
    try {
      console.log('🎯 Starting Decision Engine Calculation...');
      console.log('📊 Input data:', JSON.stringify(app, null, 2));

      // Initialize results
      const modules = {};
      const weighted = {};
      let finalScore = 0;

      // 1. DBR Module (55%)
      try {
        console.log('\n📊 Calculating DBR...');
        // calculateDBR is async, but we'll call it synchronously for now
        // In a production system, you'd want to make the whole wrapper async
        const dbrResult = await this.engine.calculateDBR(app, app.dbrData);
        modules.dbr = {
          score: dbrResult.raw || 0,
          raw: dbrResult.dbrPercentage || 0,
          isWithinThreshold: dbrResult.isWithinThreshold,
          notes: dbrResult.notes || ['DBR calculated']
        };
        weighted.dbr = (modules.dbr.score * this.engine.moduleWeights.dbr);
        console.log(`✅ DBR: ${modules.dbr.score} → Weighted: ${weighted.dbr}`);
      } catch (error) {
        console.error('❌ DBR Error:', error.message);
        modules.dbr = { score: 0, raw: 0, isWithinThreshold: false, notes: [`Error: ${error.message}`] };
        weighted.dbr = 0;
      }

      // 2. Age Module (5%)
      try {
        console.log('\n📊 Calculating Age...');
        const ageResult = this.engine.agecalc(app);
        modules.age = {
          score: ageResult.raw || 0,
          raw: ageResult.age || 0,
          notes: ageResult.notes || ['Age calculated']
        };
        weighted.age = (modules.age.score * this.engine.moduleWeights.age);
        console.log(`✅ Age: ${modules.age.score} → Weighted: ${weighted.age}`);
      } catch (error) {
        console.error('❌ Age Error:', error.message);
        modules.age = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.age = 0;
      }

      // 3. City Module (5%)
      try {
        console.log('\n📊 Calculating City...');
        const cityResult = this.engine.scoreCity(app);
        modules.city = {
          score: cityResult.raw || 0,
          raw: cityResult.raw || 0,
          notes: cityResult.notes || ['City score calculated']
        };
        weighted.city = (modules.city.score * this.engine.moduleWeights.city);
        console.log(`✅ City: ${modules.city.score} → Weighted: ${weighted.city}`);
      } catch (error) {
        console.error('❌ City Error:', error.message);
        modules.city = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.city = 0;
      }

      // 4. Income Module (10%)
      try {
        console.log('\n📊 Calculating Income...');
        const income = app.net_monthly_income || 0;
        const incomeScore = this.engine.calculateIncomeScore(income);
        modules.income = {
          score: incomeScore,
          raw: income,
          notes: [`Income: PKR ${income.toLocaleString()}`]
        };
        weighted.income = (modules.income.score * this.engine.moduleWeights.income);
        console.log(`✅ Income: ${modules.income.score} → Weighted: ${weighted.income}`);
      } catch (error) {
        console.error('❌ Income Error:', error.message);
        modules.income = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.income = 0;
      }

      // 5. SPU Module (5%)
      try {
        console.log('\n📊 Calculating SPU...');
        const spuResult = this.engine.spu(app);
        modules.spu = {
          score: spuResult.raw || 0,
          raw: spuResult.raw || 0,
          notes: spuResult.notes || [],
          flags: spuResult.flags || []
        };
        weighted.spu = (modules.spu.score * this.engine.moduleWeights.spu);
        console.log(`✅ SPU: ${modules.spu.score} → Weighted: ${weighted.spu}`);
      } catch (error) {
        console.error('❌ SPU Error:', error.message);
        modules.spu = { score: 0, raw: 0, notes: [`Error: ${error.message}`], flags: [] };
        weighted.spu = 0;
      }

      // 6. EAMVU Module (5%)
      try {
        console.log('\n📊 Calculating EAMVU...');
        const eamvuResult = this.engine.eamvu(app);
        modules.eamvu = {
          score: eamvuResult.raw || 0,
          raw: eamvuResult.raw || 0,
          notes: eamvuResult.notes || []
        };
        weighted.eamvu = (modules.eamvu.score * this.engine.moduleWeights.eamvu);
        console.log(`✅ EAMVU: ${modules.eamvu.score} → Weighted: ${weighted.eamvu}`);
      } catch (error) {
        console.error('❌ EAMVU Error:', error.message);
        modules.eamvu = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.eamvu = 0;
      }

      // 7. Application Score Module (15%)
      try {
        console.log('\n📊 Calculating Application Score...');
        console.log('  • ECIB Data Available:', app.ecib ? 'YES' : 'NO');
        console.log('  • Module Available:', this.engine.ApplicationScoreModule ? 'YES' : 'NO');
        
        if (this.engine.ApplicationScoreModule) {
          const appScoreModule = new this.engine.ApplicationScoreModule();
          // Pass 3 parameters: ilosData, cbsData (ecib), dbrScore
          const appScoreResult = appScoreModule.calculate(app, app.ecib || {}, modules.dbr?.score || 0);
          modules.application_score = {
            score: appScoreResult.raw || 0,  // Use 'raw' instead of 'score'
            raw: appScoreResult.raw || 0,
            notes: appScoreResult.notes || []
          };
          weighted.application_score = (modules.application_score.score * this.engine.moduleWeights.application_score);
          console.log(`✅ Application Score: ${modules.application_score.score} → Weighted: ${weighted.application_score}`);
        } else {
          console.log('⚠️  Application Score Module not found');
          modules.application_score = { score: 0, raw: 0, notes: ['Module not available'] };
          weighted.application_score = 0;
        }
      } catch (error) {
        console.error('❌ Application Score Error:', error.message);
        console.error('   Stack:', error.stack);
        modules.application_score = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.application_score = 0;
      }

      // 8. Behavioral Score Module (5%) - for ETB customers only
      try {
        console.log('\n📊 Calculating Behavioral Score...');
        console.log('  • ECIB Data Available:', app.ecib ? 'YES' : 'NO');
        console.log('  • Is Existing Customer (ETB):', app.is_existing_customer ? 'YES' : 'NO');
        console.log('  • Module Available:', this.engine.BehavioralScoreModule ? 'YES' : 'NO');
        
        if (this.engine.BehavioralScoreModule) {
          const behavioralModule = new this.engine.BehavioralScoreModule();
          // Pass 2 parameters: cbsData (ecib), isETB flag
          const isETB = app.is_existing_customer === true || app.is_existing_customer === 'true';
          const behavioralResult = behavioralModule.calculate(app.ecib || {}, isETB);
          modules.behavioral_score = {
            score: behavioralResult.raw || 0,
            raw: behavioralResult.raw || 0,
            notes: behavioralResult.notes || []
          };
          weighted.behavioral_score = (modules.behavioral_score.score * this.engine.moduleWeights.behavioral_score);
          console.log(`✅ Behavioral Score: ${modules.behavioral_score.score} → Weighted: ${weighted.behavioral_score}`);
        } else {
          console.log('⚠️  Behavioral Score Module not found');
          modules.behavioral_score = { score: 0, raw: 0, notes: ['Module not available'] };
          weighted.behavioral_score = 0;
        }
      } catch (error) {
        console.error('❌ Behavioral Score Error:', error.message);
        console.error('   Stack:', error.stack);
        modules.behavioral_score = { score: 0, raw: 0, notes: [`Error: ${error.message}`] };
        weighted.behavioral_score = 0;
      }

      // Calculate Final Score
      finalScore = Object.values(weighted).reduce((sum, val) => sum + (val || 0), 0);
      
      // Determine Decision
      let decision = 'REVIEW_REQUIRED';
      let risk_level = 'MEDIUM';
      let recommendation = '';

      if (finalScore >= 75) {
        decision = 'APPROVED';
        risk_level = 'LOW';
        recommendation = 'Application recommended for approval';
      } else if (finalScore >= 60) {
        decision = 'REVIEW_REQUIRED';
        risk_level = 'MEDIUM';
        recommendation = 'Manual review recommended';
      } else if (finalScore >= 40) {
        decision = 'REVIEW_REQUIRED';
        risk_level = 'HIGH';
        recommendation = 'High risk - detailed review required';
      } else {
        decision = 'REJECTED';
        risk_level = 'CRITICAL';
        recommendation = 'Application does not meet minimum criteria';
      }

      // Check critical failures
      const criticalChecks = {
        spu_passed: modules.spu.score > 0,
        age_passed: modules.age.score > 0,
        dbr_passed: modules.dbr.score >= 30
      };

      const critical_checks_passed = Object.values(criticalChecks).every(v => v);

      if (!critical_checks_passed) {
        decision = 'REJECTED';
        risk_level = 'CRITICAL';
        recommendation = 'Failed critical checks';
      }

      const result = {
        modules,
        weighted,
        final_score: parseFloat(finalScore.toFixed(2)),
        decision,
        risk_level,
        recommendation,
        critical_checks: criticalChecks,
        critical_checks_passed
      };

      console.log('\n🎉 Decision Engine Calculation Complete!');
      console.log(`📊 Final Score: ${result.final_score}`);
      console.log(`✅ Decision: ${result.decision}`);
      console.log(`⚠️ Risk Level: ${result.risk_level}`);

      return result;

    } catch (error) {
      console.error('❌ Fatal Error in Decision Engine:', error);
      throw new Error(`Decision Engine Error: ${error.message}`);
    }
  }

  /**
   * Calculate DBR (Debt Burden Ratio)
   */
  dbr(app) {
    return this.engine.dbr(app);
  }
}

module.exports = DecisionEngineWrapper;

