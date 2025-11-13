#!/bin/bash
# PostgreSQL Migration - Quick Start Script
# Run this before starting code migration

set -e

echo "======================================"
echo "PostgreSQL Migration - Quick Start"
echo "======================================"

# Step 1: Start PostgreSQL
echo ""
echo "Step 1: Starting PostgreSQL container..."
cd /home/ertu/test/modern-portfolio-website
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Step 2: Verify schema
echo ""
echo "Step 2: Verifying database schema..."
docker exec modern-portfolio-website_postgres_1 psql -U portfolio_user -d portfolio_db -c "\dt" || {
    echo "ERROR: Schema not created. Check migration file."
    exit 1
}

echo ""
echo "✓ Database schema created successfully!"

# Step 3: Check if Redis has data
echo ""
echo "Step 3: Checking Redis data..."
docker exec modern-portfolio-website_redis_1 redis-cli KEYS "*" | head -5

echo ""
echo "======================================"
echo "✓ PostgreSQL is ready!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Open NEW CHAT SESSION"
echo "2. Say: 'Continue PostgreSQL migration - Session 1: Portfolio endpoints'"
echo "3. Paste this file path: /home/ertu/test/modern-portfolio-website/MIGRATION_SESSION_PLAN.md"
echo ""
