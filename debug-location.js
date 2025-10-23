// Quick test to see what's in the investigation notes
const testNotes = `
Verification Comments: fsds
Employment Verification: dsf
Neighborhood Feedback: df
General Observations: fds

📍 Location: Lat: 37.421998, Long: -122.084000
Timestamp: 10/23/2025, 2:30:45 PM
Accuracy: 12m
`;

console.log('Testing location extraction...');

// Extract location data (support negative coordinates)
const latMatch = testNotes.match(/Lat:\s*([-\d.]+)/);
const longMatch = testNotes.match(/Long:\s*([-\d.]+)/);
const timestampMatch = testNotes.match(/Timestamp:\s*([^\n]+)/);
const accuracyMatch = testNotes.match(/Accuracy:\s*(\d+)m/);

console.log('Matches:');
console.log('latMatch:', latMatch);
console.log('longMatch:', longMatch);
console.log('timestampMatch:', timestampMatch);
console.log('accuracyMatch:', accuracyMatch);

// Build location JSON
let locationData = null;
if (latMatch && longMatch) {
  locationData = {
    latitude: parseFloat(latMatch[1]),
    longitude: parseFloat(longMatch[1]),
    timestamp: timestampMatch ? timestampMatch[1].trim() : null,
    accuracy: accuracyMatch ? parseInt(accuracyMatch[1]) : null,
    capturedAt: new Date().toISOString()
  };
}

console.log('Final locationData:', locationData);
