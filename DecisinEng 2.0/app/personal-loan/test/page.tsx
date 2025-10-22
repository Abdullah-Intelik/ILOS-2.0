export default function PersonalLoanTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Personal Loan Test Page</h1>
          <p className="text-gray-600 mb-4">This is a test page to verify the routing is working.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Route Working!</h2>
            <p className="text-green-700">The Personal Loan route is accessible at /personal-loan/test</p>
          </div>
          <div className="mt-4">
            <a 
              href="/personal-loan" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Main Personal Loan Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

