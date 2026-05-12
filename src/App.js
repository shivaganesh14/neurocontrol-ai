import React, { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('testing');
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('https://neurocontrol-api.onrender.com/health');
      const data = await response.json();
      
      if (response.ok) {
        setApiStatus('success');
        setApiData(data);
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
      console.error('API test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-500 mb-4">🧠 NeuroControl AI</h1>
          <p className="text-xl text-gray-300">Next-Generation Industrial Control System</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">🎯 System Status</h2>
            <div className="space-y-3">
              <div className="bg-green-900 p-3 rounded">
                <span className="text-green-300">✅ Database</span>
                <p className="text-sm text-gray-400">Supabase PostgreSQL</p>
              </div>
              <div className="bg-green-900 p-3 rounded">
                <span className="text-green-300">✅ Backend</span>
                <p className="text-sm text-gray-400">Render Flask API</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">🚀 Deployment Status</h2>
            <div className="space-y-3">
              <div className="bg-blue-900 p-3 rounded">
                <span className="text-blue-300">✅ Frontend</span>
                <p className="text-sm text-gray-400">Vercel Hosting</p>
              </div>
              <div className="bg-purple-900 p-3 rounded">
                <span className="text-purple-300">⚡ Real-time</span>
                <p className="text-sm text-gray-400">WebSocket Ready</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-900 p-6 rounded-lg border border-yellow-700 text-center mb-6">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-4">🎉 Production Ready!</h2>
          <p className="text-lg mb-6">Your NeuroControl AI system is deployed and ready for industrial use.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={testAPI} 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              🔍 Test API
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {apiStatus === 'testing' && (
          <div className="bg-yellow-800 p-4 rounded-lg text-center">
            <p className="text-yellow-300">Testing API connection...</p>
          </div>
        )}
        
        {apiStatus === 'success' && apiData && (
          <div className="bg-green-800 p-4 rounded-lg">
            <h3 className="text-green-300 font-semibold mb-2">✅ API Connected!</h3>
            <p className="text-sm">Status: {apiData.status}</p>
            <p className="text-sm">Service: {apiData.service}</p>
            <p className="text-sm">Timestamp: {apiData.timestamp}</p>
          </div>
        )}
        
        {apiStatus === 'error' && (
          <div className="bg-red-800 p-4 rounded-lg">
            <h3 className="text-red-300 font-semibold mb-2">❌ API Connection Failed</h3>
            <p className="text-sm">Please check if the backend is running on Render.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
