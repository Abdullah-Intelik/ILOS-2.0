// Test script for DBR calculation
const fetch = require('node-fetch');

async function testDBRCalculation() {
    const testData = {
        losId: 'TEST123',
        loan_type: 'Cashplus'
    };

    try {
        console.log('Testing DBR calculation...');
        console.log('Test data:', testData);

        const response = await fetch('http://localhost:3002/calculate-dbr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ DBR calculation successful!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        console.error('❌ DBR calculation failed:', error.message);
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testDBRCalculation()
        .then(() => {
            console.log('Test completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testDBRCalculation }; 