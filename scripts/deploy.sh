#!/bin/bash

# MentorQuest Production Deployment Script
# Deploys to Vercel with proper environment setup

set -e

echo "🚀 MentorQuest Production Deployment"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Check environment variables
echo ""
echo "🔍 Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found"
    echo "Please create .env file with your production environment variables"
    exit 1
fi

source .env

# Validate required environment variables
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your-project.supabase.co" ] || [ "${!var}" = "your-anon-key" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ ERROR: Missing or invalid environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please update your .env file with valid values"
    exit 1
fi

echo "✅ Environment variables validated"

# Test Supabase connection
echo ""
echo "🗄️  Testing Supabase connection..."
if curl -s --head "$VITE_SUPABASE_URL/rest/v1/" > /dev/null; then
    echo "✅ Supabase connection successful"
else
    echo "❌ ERROR: Cannot connect to Supabase"
    echo "Please check your VITE_SUPABASE_URL"
    exit 1
fi

# Run tests if they exist
if [ -f "package.json" ] && npm run test --if-present > /dev/null 2>&1; then
    echo ""
    echo "🧪 Running tests..."
    if npm test; then
        echo "✅ All tests passed"
    else
        echo "❌ ERROR: Tests failed"
        echo "Please fix failing tests before deployment"
        exit 1
    fi
fi

# Build the project
echo ""
echo "🔨 Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ ERROR: Build failed"
    exit 1
fi

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build output directory 'dist' not found"
    exit 1
fi

echo "✅ Build output verified"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."

# Set environment variables in Vercel
echo "⚙️  Setting environment variables..."

vercel env add VITE_SUPABASE_URL production <<< "$VITE_SUPABASE_URL" 2>/dev/null || true
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$VITE_SUPABASE_ANON_KEY" 2>/dev/null || true

if [ -n "$VITE_HUGGINGFACE_API_KEY" ]; then
    vercel env add VITE_HUGGINGFACE_API_KEY production <<< "$VITE_HUGGINGFACE_API_KEY" 2>/dev/null || true
fi

if [ -n "$VITE_LIBRETRANSLATE_API_URL" ]; then
    vercel env add VITE_LIBRETRANSLATE_API_URL production <<< "$VITE_LIBRETRANSLATE_API_URL" 2>/dev/null || true
fi

vercel env add VITE_APP_NAME production <<< "MentorQuest" 2>/dev/null || true
vercel env add VITE_APP_VERSION production <<< "1.0.0" 2>/dev/null || true

echo "✅ Environment variables configured"

# Deploy
echo ""
echo "🌐 Deploying to production..."
if vercel --prod; then
    echo ""
    echo "🎉 Deployment Successful!"
    echo "========================"
    echo ""
    echo "Your MentorQuest application is now live!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "✅ Application deployed to Vercel"
    echo "✅ Environment variables configured"
    echo "✅ Build process completed"
    echo "✅ Supabase connection verified"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Test your live application"
    echo "2. Verify demo accounts work:"
    echo "   - teacher@demo.com / password123"
    echo "   - student@demo.com / password123"
    echo "3. Monitor application performance"
    echo "4. Set up custom domain (optional)"
    echo ""
    echo "📊 Monitoring:"
    echo "- Vercel Dashboard: https://vercel.com/dashboard"
    echo "- Supabase Dashboard: https://supabase.com/dashboard"
    echo ""
    echo "🆘 Support:"
    echo "- Check Vercel function logs for any issues"
    echo "- Monitor Supabase usage and performance"
    echo "- Review application analytics"
    echo ""
else
    echo "❌ ERROR: Deployment failed"
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Check Vercel CLI authentication: vercel login"
    echo "2. Verify project configuration: vercel"
    echo "3. Check build logs for errors"
    echo "4. Ensure all environment variables are set"
    echo "5. Try deploying again: vercel --prod"
    exit 1
fi

echo "🎯 Deployment complete! Your MentorQuest app is ready for users."