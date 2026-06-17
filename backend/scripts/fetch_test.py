import requests

url = "https://joola.com/products.json?limit=250"
data = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}).json()
products = data.get("products", [])
print(f"Fetched {len(products)} products from Shopify\n")

paddles = [p for p in products if "paddle" in p["title"].lower()]
print(f"{len(paddles)} of them are paddles\n")

for p in paddles[:10]:   # first 10 so it's readable
    variant = p["variants"][0] if p["variants"] else {}
    image = p["images"][0]["src"] if p["images"] else "no image"
    print(f'{p["title"]}')
    print(f'   price: ${variant.get("price", "?")}')
    print(f'   url:   https://joola.com/products/{p["handle"]}')
    print(f'   image: {image}\n')
    print(f'   tags: {p.get("tags")}\n')