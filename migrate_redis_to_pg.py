#!/usr/bin/env python3
"""
Redis to PostgreSQL migration script
Migrates all data from Redis to PostgreSQL
"""

import redis
import psycopg2
import json
import sys

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Connect to PostgreSQL
conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='portfolio_db',
    user='portfolio_user',
    password='portfolio_secure_pass_2025'
)
cur = conn.cursor()

print("🔄 Starting Redis → PostgreSQL migration...")

# 1. Migrate Portfolio Items
print("\n1️⃣ Migrating portfolio items...")
portfolio_json = r.get('portfolio:items')
if portfolio_json:
    items = json.loads(portfolio_json)
    print(f"   Found {len(items)} portfolio items in Redis")
    
    for item in items:
        cur.execute("""
            INSERT INTO portfolio_items (
                id, title, description, technologies,
                image_url, github_url, live_url, huggingface_url, display_order
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                technologies = EXCLUDED.technologies,
                image_url = EXCLUDED.image_url,
                github_url = EXCLUDED.github_url,
                live_url = EXCLUDED.live_url,
                huggingface_url = EXCLUDED.huggingface_url,
                display_order = EXCLUDED.display_order
        """, (
            item['id'],
            item['title'],
            item['description'],
            json.dumps(item['technologies']),
            item.get('image_url'),
            item.get('github_url'),
            item.get('live_url'),
            item.get('huggingface_url'),
            item.get('order', 0)
        ))
    conn.commit()
    print(f"   ✅ Migrated {len(items)} portfolio items")
else:
    print("   ⚠️  No portfolio items in Redis")

# 2. Check results
cur.execute("SELECT COUNT(*) FROM portfolio_items")
count = cur.fetchone()[0]
print(f"\n📊 PostgreSQL now has {count} portfolio items")

cur.close()
conn.close()

print("\n✅ Migration complete!")
