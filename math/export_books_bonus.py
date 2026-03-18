"""Sample books from bonus sims (100% Cosmic Break) and export for frontend."""
import json, random, os

bonus_path = os.path.join(os.path.dirname(__file__), 'library', 'books', 'books_bonus.json')
out_path = 'C:/Users/dpatt/Desktop/SlotMachine-Design-Pipeline/engines/web-sdk/apps/star-gazing/static/books_bonus.json'

print('Loading bonus books...')
with open(bonus_path) as f:
    bonus_books = json.load(f)
print(f'  Total: {len(bonus_books)}')

# All bonus books are Cosmic Break — sample 100
sample = random.sample(bonus_books, min(100, len(bonus_books)))

for i, book in enumerate(sample):
    book['id'] = i

random.shuffle(sample)
print(f'Sampled: {len(sample)}')

with open(out_path, 'w') as f:
    json.dump(sample, f)

print(f'Written: {os.path.getsize(out_path):,} bytes')
