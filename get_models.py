import urllib.request, json, re
key=re.search(r'GROQ_API_KEY = \"([^\"]+)\"', open('backend/main.py').read()).group(1)
req=urllib.request.Request('https://api.groq.com/openai/v1/models', headers={'Authorization': 'Bearer '+key})
print(json.loads(urllib.request.urlopen(req).read())['data'])
