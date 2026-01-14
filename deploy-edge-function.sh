#!/bin/bash

# Supabase Edge Function Deployment Script
# This script deploys the send-reminder-email Edge Function to Supabase

echo "🚀 Deploying Supabase Edge Function: send-reminder-email"
echo "=========================================================="
echo ""

# Check if Supabase CLI is available via npx
echo "📦 Checking Supabase CLI via npx..."
if ! npx supabase --version &> /dev/null
then
    echo "❌ Supabase CLI could not be loaded via npx."
    exit 1
fi
echo "✅ Supabase CLI ready"
echo ""

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! npx supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo "🔑 Please login to Supabase:"
    npx supabase login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi
echo "✅ Authenticated"
echo ""

# Check if project is linked
echo "🔗 Checking project link..."
if [ ! -f "supabase/config.toml" ] && [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked yet"
    # Try to auto-link using the ID from .env if possible, or ask
    PROJECT_ID="bwuigvtcvpwxvmizmhoq" # Extracted from .env earlier
    echo "🔗 Linking project with ID: $PROJECT_ID..."
    npx supabase link --project-ref "$PROJECT_ID"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link project"
        exit 1
    fi
fi
echo "✅ Project linked"
echo ""

# Deploy the function
echo "📤 Deploying Edge Function..."
npx supabase functions deploy send-reminder-email

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed"
    echo "Please check the error messages above and try again"
    exit 1
fi

echo ""
echo "=========================================================="
echo "✅ Edge Function deployed successfully!"
echo "=========================================================="
echo ""
echo "📝 Next Steps:"
echo "1. Set a test reminder for 1-2 minutes in the future"
echo "2. Keep your app open (the poller runs every 60 seconds)"
echo "3. Wait for the reminder time to pass"
echo "4. Check your email inbox (and spam folder)"
echo ""
echo "🔍 To view function logs:"
echo "   supabase functions logs send-reminder-email --follow"
echo ""
echo "📚 For more information, see: EDGE_FUNCTION_DEPLOYMENT.md"
echo ""
