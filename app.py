import requests, time, json, os
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def scrape_startpage(query, n=10):
    s = requests.Session()
    s.headers.update({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5', 'Accept-Encoding': 'gzip, deflate', 'Connection': 'keep-alive'})
    try:
        time.sleep(1)
        r = s.get('https://www.startpage.com/sp/search', params={'query': query, 'cat': 'web', 'pl': 'opensearch'})
        r.raise_for_status()
        soup = BeautifulSoup(r.content, 'html.parser')
        results = []
        for c in soup.find_all('div', class_='result')[:n]:
            t = c.find('a', class_='result-title')
            if not t: continue
            d = c.find('p', class_='result-description') or c.find('span', class_='result-description')
            results.append({'title': t.get_text(strip=True), 'url': t.get('href'), 'desc': d.get_text(strip=True) if d else ''})
        return results
    except Exception as e:
        print(f"Error: {e}")
        return []

def get_weather_from_ip(ip_address):
    try:
        ip_response = requests.get(f'https://ipinfo.io/{ip_address}/json')
        ip_response.raise_for_status()
        ip_data = ip_response.json()

        if ip_data.get('error'):
            return {'error': 'Invalid IP address or unable to locate'}

        loc = ip_data.get('loc', '')
        if not loc:
            return {'error': 'Location data not available'}

        lat, lon = loc.split(',')
        city = ip_data.get('city', 'Unknown')
        country = ip_data.get('country', '')

        if country != 'US':
            return {'error': 'Weather service only available for US locations'}

        points_response = requests.get(f'https://api.weather.gov/points/{lat},{lon}')
        points_response.raise_for_status()
        points_data = points_response.json()

        forecast_url = points_data['properties']['forecast']
        forecast_response = requests.get(forecast_url)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()

        current_period = forecast_data['properties']['periods'][0]

        return {
            'ip': ip_address,
            'location': {
                'city': city,
                'country': ip_data.get('country'),
                'latitude': lat,
                'longitude': lon
            },
            'weather': {
                'temperature': current_period['temperature'],
                'feels_like': None,
                'humidity': None,
                'description': current_period['detailedForecast'],
                'icon': None
            }
        }
    except requests.exceptions.RequestException as e:
        if '429' in str(e):
            return {'error': 'Rate limit exceeded. Please try again later.'}
        return {'error': f'API request failed: {str(e)}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Missing query parameter "q"'}), 400

    n = request.args.get('n', default=10, type=int)
    results = scrape_startpage(query, n)
    return jsonify({'query': query, 'results': results})

@app.route('/weather', methods=['GET'])
def weather():
    ip = request.args.get('ip')
    if not ip:
        return jsonify({'error': 'Missing IP parameter "ip"'}), 400

    weather_data = get_weather_from_ip(ip)
    if 'error' in weather_data:
        return jsonify(weather_data), 400

    return jsonify(weather_data)

@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'running', 'message': 'GridLock search API'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, debug=True)
