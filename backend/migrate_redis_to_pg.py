#!/usr/bin/env python3
"""
Redis to PostgreSQL Migration Script
Migrates all data from Redis to PostgreSQL before switching to SQL
"""

import json
import redis
import psycopg2
from psycopg2.extras import Json
import sys

# Redis connection
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# PostgreSQL connection
pg_conn = psycopg2.connect(
    dbname='portfolio_db',
    user='portfolio_user',
    password='portfolio_secure_pass_2025',
    host='localhost',
    port='5432'
)
pg_cursor = pg_conn.cursor()

def migrate_portfolio():
    """Migrate portfolio items"""
    print("Migrating portfolio items...")
    data = redis_client.get('portfolio:items')
    if data:
        items = json.loads(data)
        for item in items:
            pg_cursor.execute("""
                INSERT INTO portfolio_items (
                    id, title, description, technologies, image_url,
                    github_url, live_url, huggingface_url, display_order
                ) VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT DO NOTHING
            """, (
                item.get('title'),
                item.get('description'),
                Json(item.get('technologies', [])),
                item.get('image_url'),
                item.get('github_url'),
                item.get('live_url'),
                item.get('huggingface_url'),
                item.get('order', 0)
            ))
        print(f"  ✓ Migrated {len(items)} portfolio items")
    else:
        print("  ℹ No portfolio data found in Redis")

def migrate_about():
    """Migrate about info"""
    print("Migrating about info...")
    data = redis_client.get('about:info')
    if data:
        about = json.loads(data)
        pg_cursor.execute("""
            INSERT INTO about_info (
                name, title, bio, skills, email, github, linkedin
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            about.get('name'),
            about.get('title'),
            about.get('bio'),
            Json(about.get('skills', [])),
            about.get('email'),
            about.get('github'),
            about.get('linkedin')
        ))
        print("  ✓ Migrated about info")
    else:
        print("  ℹ No about data found in Redis")

def migrate_resume():
    """Migrate resume data"""
    print("Migrating resume data...")
    data = redis_client.get('resume:data')
    if data:
        resume = json.loads(data)
        pg_cursor.execute("""
            INSERT INTO resume_data (
                personal_info, section_order, summary, summary_enabled,
                skills, skills_enabled, soft_skills, soft_skills_enabled,
                education, education_enabled, experience, experience_enabled,
                projects, projects_enabled, languages, languages_enabled,
                certifications, certifications_enabled, awards, awards_enabled,
                publications, publications_enabled, volunteer, volunteer_enabled,
                interests, interests_enabled, references, references_enabled
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT DO NOTHING
        """, (
            Json(resume.get('personal_info', {})),
            Json(resume.get('section_order', [])),
            resume.get('summary'),
            resume.get('summary_enabled', False),
            Json(resume.get('skills', [])),
            resume.get('skills_enabled', True),
            Json(resume.get('soft_skills', [])),
            resume.get('soft_skills_enabled', True),
            Json(resume.get('education', [])),
            resume.get('education_enabled', True),
            Json(resume.get('experience', [])),
            resume.get('experience_enabled', True),
            Json(resume.get('projects', [])),
            resume.get('projects_enabled', True),
            Json(resume.get('languages', [])),
            resume.get('languages_enabled', True),
            Json(resume.get('certifications', [])),
            resume.get('certifications_enabled', True),
            Json(resume.get('awards', [])),
            resume.get('awards_enabled', True),
            Json(resume.get('publications', [])),
            resume.get('publications_enabled', True),
            Json(resume.get('volunteer', [])),
            resume.get('volunteer_enabled', True),
            Json(resume.get('interests', [])),
            resume.get('interests_enabled', True),
            Json(resume.get('references', [])),
            resume.get('references_enabled', False)
        ))
        print("  ✓ Migrated resume data")
    else:
        print("  ℹ No resume data found in Redis")

def migrate_contacts():
    """Migrate contact messages"""
    print("Migrating contact messages...")
    data = redis_client.get('contacts:messages')
    if data:
        messages = json.loads(data)
        for msg in messages:
            pg_cursor.execute("""
                INSERT INTO contact_messages (
                    name, email, message, is_read, created_at
                ) VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                msg.get('name'),
                msg.get('email'),
                msg.get('message'),
                msg.get('read', False),
                msg.get('created_at')
            ))
        print(f"  ✓ Migrated {len(messages)} contact messages")
    else:
        print("  ℹ No contact messages found in Redis")

def migrate_footer():
    """Migrate footer settings"""
    print("Migrating footer settings...")
    data = redis_client.get('footer:text')
    if data:
        footer = json.loads(data)
        pg_cursor.execute("""
            UPDATE footer_settings SET
                text_tr = %s,
                text_en = %s,
                enabled = %s,
                show_backend = %s
            WHERE id = (SELECT id FROM footer_settings LIMIT 1)
        """, (
            footer.get('text_tr'),
            footer.get('text_en'),
            footer.get('enabled', True),
            footer.get('show_backend', False)
        ))
        print("  ✓ Migrated footer settings")
    else:
        print("  ℹ No footer data found in Redis")

def migrate_features():
    """Migrate features settings"""
    print("Migrating features settings...")
    data = redis_client.get('features:data')
    if data:
        features = json.loads(data)
        pg_cursor.execute("""
            INSERT INTO features_settings (
                performance_tr, performance_en, scalable_tr, scalable_en,
                secure_tr, secure_en
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            Json(features.get('performance_tr', {})),
            Json(features.get('performance_en', {})),
            Json(features.get('scalable_tr', {})),
            Json(features.get('scalable_en', {})),
            Json(features.get('secure_tr', {})),
            Json(features.get('secure_en', {}))
        ))
        print("  ✓ Migrated features settings")
    else:
        print("  ℹ No features data found in Redis")

def migrate_hero():
    """Migrate hero section"""
    print("Migrating hero section...")
    data = redis_client.get('hero:section')
    if data:
        hero = json.loads(data)
        pg_cursor.execute("""
            INSERT INTO hero_section (
                greeting_tr, greeting_en, name, title_tr, title_en
            ) VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            hero.get('greeting_tr'),
            hero.get('greeting_en'),
            hero.get('name'),
            hero.get('title_tr'),
            hero.get('title_en')
        ))
        print("  ✓ Migrated hero section")
    else:
        print("  ℹ No hero data found in Redis")

def migrate_visitor_logs():
    """Migrate visitor logs (last 500)"""
    print("Migrating visitor logs...")
    data = redis_client.get('logs:visitors')
    if data:
        logs = json.loads(data)
        for log in logs[-500:]:  # Only last 500 logs
            pg_cursor.execute("""
                INSERT INTO visitor_logs (
                    ip, user_agent, path, method, referer, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                log.get('ip'),
                log.get('user_agent'),
                log.get('path'),
                log.get('method'),
                log.get('referer'),
                log.get('timestamp')
            ))
        print(f"  ✓ Migrated {min(len(logs), 500)} visitor logs")
    else:
        print("  ℹ No visitor logs found in Redis")

def main():
    print("=" * 60)
    print("Redis to PostgreSQL Migration")
    print("=" * 60)
    
    try:
        # Test connections
        print("\nTesting connections...")
        redis_client.ping()
        print("  ✓ Redis connected")
        
        pg_cursor.execute("SELECT 1")
        print("  ✓ PostgreSQL connected")
        
        # Run migrations
        print("\nStarting migration...")
        migrate_portfolio()
        migrate_about()
        migrate_resume()
        migrate_contacts()
        migrate_footer()
        migrate_features()
        migrate_hero()
        migrate_visitor_logs()
        
        # Commit changes
        pg_conn.commit()
        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        pg_conn.rollback()
        sys.exit(1)
    finally:
        pg_cursor.close()
        pg_conn.close()

if __name__ == "__main__":
    main()
