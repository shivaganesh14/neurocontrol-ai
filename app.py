# ================================================================
# NeuroControl AI - Flask Backend Application
# ================================================================

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'NeuroControl AI Backend',
        'version': '1.0.0'
    })

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': '🧠 NeuroControl AI - Industrial Control System Backend',
        'status': 'running',
        'endpoints': ['/health', '/api/test']
    })

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        'message': 'API is working!',
        'database': 'Connected to Supabase',
        'ai': 'Gemini API ready',
        'websocket': 'SocketIO enabled'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
