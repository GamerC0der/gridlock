import requests, time, json
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify

app = Flask(__name__)

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

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Missing query parameter "q"'}), 400

    n = request.args.get('n', default=10, type=int)
    results = scrape_startpage(query, n)
    return jsonify({'query': query, 'results': results})

@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'running', 'message': 'GridLock search API'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, debug=True)
