#!/bin/bash

# MentorQuest Development Setup Script
# Sets up the complete development environment

set -e

echo "🚀 MentorQuest Development Setup"
echo "================================"

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ ERROR: Node.js version $NODE_VERSION is too old"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi

# Check for .env file
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please update .env with your Supabase credentials"
    else
        echo "❌ ERROR: .env.example file not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Check environment variables
echo ""
echo "🔍 Checking environment configuration..."
source .env 2>/dev/null || true

if [ -z "$VITE_SUPABASE_URL" ] || [ "$VITE_SUPABASE_URL" = "https://your-project.supabase.co" ]; then
    echo "⚠️  WARNING: VITE_SUPABASE_URL not configured"
    echo "Please update your .env file with your Supabase project URL"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ "$VITE_SUPABASE_ANON_KEY" = "your-anon-key" ]; then
    echo "⚠️  WARNING: VITE_SUPABASE_ANON_KEY not configured"
    echo "Please update your .env file with your Supabase anon key"
fi

# Create necessary directories
echo ""
echo "📁 Creating project directories..."
mkdir -p supabase/migrations
mkdir -p supabase/seed
mkdir -p scripts
mkdir -p tests
echo "✅ Project directories created"

# Check if database is accessible (if configured)
if [ -n "$VITE_SUPABASE_URL" ] && [ "$VITE_SUPABASE_URL" != "https://your-project.supabase.co" ]; then
    echo ""
    echo "🗄️  Testing database connection..."
    
    # Simple curl test to check if Supabase is accessible
    if curl -s --head "$VITE_SUPABASE_URL/rest/v1/" > /dev/null; then
        echo "✅ Supabase connection successful"
    else
        echo "⚠️  WARNING: Cannot connect to Supabase"
        echo "Please check your VITE_SUPABASE_URL in .env"
    fi
fi

# Run type checking
echo ""
echo "🔍 Running TypeScript type check..."
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  WARNING: TypeScript compilation issues detected"
    echo "Run 'npm run build' to see detailed errors"
fi

# Check if migrations exist
echo ""
echo "🗄️  Checking database setup..."
if [ -f "supabase/migrations/000_idempotent_schema.sql" ]; then
    echo "✅ Database migration file found"
else
    echo "⚠️  WARNING: Database migration file not found"
    echo "Please ensure supabase/migrations/000_idempotent_schema.sql exists"
fi

if [ -f "supabase/seed/seed-safe.sql" ]; then
    echo "✅ Database seed file found"
else
    echo "⚠️  WARNING: Database seed file not found"
    echo "Please ensure supabase/seed/seed-safe.sql exists"
fi

echo ""
echo "🎉 Development Setup Complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo ""
echo "1. 📝 Configure your environment:"
echo "   - Edit .env with your Supabase credentials"
echo "   - Get credentials from https://supabase.com"
echo ""
echo "2. 🗄️  Set up your database:"
echo "   - Run your migration: psql \$DATABASE_URL -f supabase/migrations/000_idempotent_schema.sql"
echo "   - Run your seed data: psql \$DATABASE_URL -f supabase/seed/seed-safe.sql"
echo "   - Or use the Supabase dashboard SQL editor"
echo ""
echo "3. 🚀 Start development:"
echo "   npm run dev"
echo ""
echo "4. 🧪 Test your setup:"
echo "   - Open http://localhost:5173"
echo "   - Login with: teacher@demo.com / password123"
echo "   - Or: student@demo.com / password123"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - docs/SETUP.md - Detailed setup guide"
echo "   - docs/API.md - API documentation"
echo ""
echo "🆘 Need help?"
echo "   - Check the logs for any errors"
echo "   - Ensure all environment variables are set"
echo "   - Verify Supabase project is active"
echo ""
echo "Happy coding! 🎯"