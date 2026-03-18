"""Sample books from base sims only (already contains bonus sequences) and export for frontend."""
import json, random, os, sys

base_path = os.path.join(os.path.dirname(__file__), 'library', 'books', 'books_base.json')
out_path = 'C:/Users/dpatt/Desktop/SlotMachine-Design-Pipeline/engines/web-sdk/apps/star-gazing/static/books_base.json'

print('Loading base books...')
with open(base_path) as f:
    base_books = json.load(f)
print(f'  Total: {len(base_books)}')

# Categorize
cosmic_break = []
standard_fs = []
no_fs = []

for b in base_books:
    types = {e['type'] for e in b['events']}
    if 'cosmicBreakInit' in types:
        cosmic_break.append(b)
    elif 'freeSpinTrigger' in types:
        standard_fs.append(b)
    else:
        no_fs.append(b)

print(f'  Cosmic Break: {len(cosmic_break)}')
print(f'  Standard FS: {len(standard_fs)}')
print(f'  No FS: {len(no_fs)}')

# Sample 100 books: balanced mix
sample = []
sample.extend(random.sample(no_fs, min(50, len(no_fs))))
sample.extend(random.sample(cosmic_break, min(30, len(cosmic_break))))
sample.extend(random.sample(standard_fs, min(20, len(standard_fs))))

for i, book in enumerate(sample):
    book['id'] = i

random.shuffle(sample)
print(f'Sampled: {len(sample)}')

with open(out_path, 'w') as f:
    json.dump(sample, f)

print(f'Written: {os.path.getsize(out_path):,} bytes')
