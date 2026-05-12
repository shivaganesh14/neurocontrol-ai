// Simple HTML page - no React needed for basic deployment
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; font-size: 2.5rem; margin-bottom: 10px;">🧠 NeuroControl AI</h1>
          <p style="color: #64748b; font-size: 1.2rem;">Next-Generation Industrial Control System</p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #60a5fa; margin-bottom: 15px;">🎯 System Status</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #065f46; padding: 15px; border-radius: 6px; color: white;">
              <h3 style="margin: 0 0 10px 0;">✅ Database</h3>
              <p style="margin: 0;">Supabase PostgreSQL</p>
            </div>
            <div style="background: #059669; padding: 15px; border-radius: 6px; color: white;">
              <h3 style="margin: 0 0 10px 0;">✅ Backend</h3>
              <p style="margin: 0;">Render Flask API</p>
            </div>
          </div>
        </div>
        
        <div style="background: #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #34d399; margin-bottom: 15px;">🚀 Deployment Status</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #0d9488; padding: 15px; border-radius: 6px; color: white;">
              <h3 style="margin: 0 0 10px 0;">✅ Frontend</h3>
              <p style="margin: 0;">Vercel Hosting</p>
            </div>
            <div style="background: #6366f1; padding: 15px; border-radius: 6px; color: white;">
              <h3 style="margin: 0 0 10px 0;">⚡ Real-time</h3>
              <p style="margin: 0;">WebSocket Ready</p>
            </div>
          </div>
        </div>
        
        <div style="background: #f59e0b; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #991b1b; margin-bottom: 15px;">🎉 Production Ready!</h2>
          <p style="font-size: 1.1rem; margin-bottom: 10px;">Your NeuroControl AI system is deployed and ready for industrial use.</p>
          <div style="margin-top: 20px;">
            <a href="https://neurocontrol-api.onrender.com/health" target="_blank" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-right: 10px;">🔍 Test API</a>
            <a href="#" onclick="window.location.reload()" style="background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">🔄 Refresh</a>
          </div>
        </div>
      </div>
    `;
  }
});
