from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import os
import webbrowser
import threading
import time

app = Flask(__name__, static_url_path='', static_folder='.')

API_TOKEN = "6395164884:gxBoi7xK"
API_URL = "https://leakosintapi.com/"

@app.route('/')
def index():
    return send_from_directory('.', 'web.html')

@app.route('/web.css')
def serve_css():
    return send_from_directory('.', 'web.css')

@app.route('/web.js')
def serve_js():
    return send_from_directory('.', 'web.js')

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "Пустой запрос"}), 400
        
        payload = {
            "token": API_TOKEN,
            "request": query,
            "limit": 1000,
            "lang": "ru"
        }
        
        print(f"Sending request to API: {payload}")
        response = requests.post(API_URL, json=payload, timeout=30)
        print(f"API Response status: {response.status_code}")
        
        if response.status_code != 200:
            return jsonify({"error": f"API вернул код {response.status_code}"}), response.status_code
        
        result = response.json()
        print(f"API Response data: {result}")
        
        if "Error code" in result:
            return jsonify({"error": f"API ошибка: {result['Error code']}"}), 400
        
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Таймаут при обращении к API"}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Ошибка подключения к API"}), 503
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/music/<path:filename>')
def serve_music(filename):
    return send_from_directory('music', filename)

def open_browser():
    time.sleep(1)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    if not os.path.exists('music'):
        os.makedirs('music')
        print("📁 Создана папка 'music'")
        print("📝 Положи в нее .mp4 файлы если нужно")
    
    print("🚀 Сервер запущен на http://localhost:5000")
    print(f"🔑 Используется API токен: {API_TOKEN}")
    print("🛑 Нажми Ctrl+C для остановки")
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)