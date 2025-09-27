#!/bin/sh

echo "🔄 Starting EventGO API..."

# Set timeout for database operations
DB_TIMEOUT=30
RETRY_COUNT=0
MAX_RETRIES=6

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if npx prisma db push --accept-data-loss --skip-generate; then
    echo "✅ Database schema synchronized"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "❌ Database not ready, retry $RETRY_COUNT/$MAX_RETRIES in 5 seconds..."
    sleep 5
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to connect to database after $MAX_RETRIES attempts"
  exit 1
fi

# Run migrations (optional, since db push already syncs)
echo "🔄 Running database migrations..."
npx prisma migrate deploy --skip-generate || {
  echo "⚠️ Migrations failed, schema already synced via db push"
}

echo "✅ Database setup completed"

# Start the application
echo "🚀 Starting application..."
exec npm start
