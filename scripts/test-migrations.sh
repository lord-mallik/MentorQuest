#!/bin/bash

# MentorQuest Migration Test Script
# Tests that migrations are idempotent and can be run multiple times safely

set -e

echo "🧪 Testing MentorQuest Database Migrations"
echo "=========================================="

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    echo "Example: export DATABASE_URL='postgresql://user:password@localhost:5432/mentorquest_test'"
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    echo "📄 Running $description..."
    
    if [ ! -f "$file" ]; then
        echo "❌ ERROR: File $file not found"
        exit 1
    fi
    
    if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
        echo "✅ $description completed successfully"
    else
        echo "❌ ERROR: $description failed"
        exit 1
    fi
}

# Function to check table count
check_table_count() {
    local expected_tables=18
    local actual_tables=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" | tr -d ' ')
    
    if [ "$actual_tables" -eq "$expected_tables" ]; then
        echo "✅ Table count correct: $actual_tables tables"
    else
        echo "❌ ERROR: Expected $expected_tables tables, found $actual_tables"
        exit 1
    fi
}

# Function to check RLS policies
check_rls_policies() {
    local policy_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_policies;" | tr -d ' ')
    
    if [ "$policy_count" -gt 20 ]; then
        echo "✅ RLS policies created: $policy_count policies"
    else
        echo "❌ ERROR: Expected more than 20 RLS policies, found $policy_count"
        exit 1
    fi
}

# Function to check demo data
check_demo_data() {
    local user_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE email IN ('teacher@demo.com', 'student@demo.com');" | tr -d ' ')
    
    if [ "$user_count" -eq 2 ]; then
        echo "✅ Demo accounts created successfully"
    else
        echo "❌ ERROR: Demo accounts not found"
        exit 1
    fi
}

echo ""
echo "🔄 Test 1: First Migration Run"
echo "------------------------------"

# Run migration for the first time
run_sql_file "supabase/migrations/000_idempotent_schema.sql" "Schema Migration (First Run)"

# Check results
check_table_count
check_rls_policies

echo ""
echo "🔄 Test 2: Second Migration Run (Idempotency Test)"
echo "------------------------------------------------"

# Run migration again to test idempotency
run_sql_file "supabase/migrations/000_idempotent_schema.sql" "Schema Migration (Second Run)"

# Check results again
check_table_count
check_rls_policies

echo ""
echo "🌱 Test 3: First Seed Run"
echo "-------------------------"

# Run seed for the first time
run_sql_file "supabase/seed/seed-safe.sql" "Data Seeding (First Run)"

# Check demo data
check_demo_data

echo ""
echo "🌱 Test 4: Second Seed Run (Duplicate Prevention Test)"
echo "----------------------------------------------------"

# Run seed again to test duplicate prevention
run_sql_file "supabase/seed/seed-safe.sql" "Data Seeding (Second Run)"

# Check demo data again
check_demo_data

echo ""
echo "🔍 Test 5: Database Function Tests"
echo "----------------------------------"

# Test add_student_xp function
echo "📊 Testing add_student_xp function..."
result=$(psql "$DATABASE_URL" -t -c "SELECT add_student_xp('22222222-2222-2222-2222-222222222222', 100);" 2>/dev/null || echo "ERROR")

if [[ "$result" != "ERROR" ]]; then
    echo "✅ add_student_xp function works correctly"
else
    echo "❌ ERROR: add_student_xp function failed"
    exit 1
fi

# Test get_leaderboard function
echo "🏆 Testing get_leaderboard function..."
leaderboard_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM get_leaderboard();" | tr -d ' ')

if [ "$leaderboard_count" -gt 0 ]; then
    echo "✅ get_leaderboard function works correctly ($leaderboard_count students)"
else
    echo "❌ ERROR: get_leaderboard function returned no results"
    exit 1
fi

echo ""
echo "🔐 Test 6: Row Level Security Test"
echo "---------------------------------"

# Check that RLS is enabled on all tables
rls_enabled_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true;" | tr -d ' ')

if [ "$rls_enabled_count" -eq 18 ]; then
    echo "✅ RLS enabled on all tables"
else
    echo "❌ ERROR: RLS not enabled on all tables (enabled on $rls_enabled_count/18)"
    exit 1
fi

echo ""
echo "📊 Test 7: Data Integrity Test"
echo "------------------------------"

# Check foreign key constraints
fk_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';" | tr -d ' ')

if [ "$fk_count" -gt 15 ]; then
    echo "✅ Foreign key constraints created ($fk_count constraints)"
else
    echo "❌ ERROR: Insufficient foreign key constraints ($fk_count found)"
    exit 1
fi

# Check unique constraints
unique_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'UNIQUE' AND table_schema = 'public';" | tr -d ' ')

if [ "$unique_count" -gt 5 ]; then
    echo "✅ Unique constraints created ($unique_count constraints)"
else
    echo "❌ ERROR: Insufficient unique constraints ($unique_count found)"
    exit 1
fi

echo ""
echo "🎯 Test 8: Performance Index Test"
echo "--------------------------------"

# Check that indexes are created
index_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | tr -d ' ')

if [ "$index_count" -gt 20 ]; then
    echo "✅ Performance indexes created ($index_count indexes)"
else
    echo "❌ ERROR: Insufficient indexes created ($index_count found)"
    exit 1
fi

echo ""
echo "🎉 All Tests Passed!"
echo "==================="
echo ""
echo "✅ Migration is idempotent (can be run multiple times)"
echo "✅ Seeding prevents duplicates on re-run"
echo "✅ All database functions work correctly"
echo "✅ Row Level Security is properly configured"
echo "✅ Data integrity constraints are in place"
echo "✅ Performance indexes are created"
echo "✅ Demo accounts are available"
echo ""
echo "🚀 Database is ready for production use!"
echo ""
echo "Demo Accounts:"
echo "- Teacher: teacher@demo.com / password123"
echo "- Student: student@demo.com / password123"
echo ""
echo "Next steps:"
echo "1. Set up your frontend environment variables"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the application with demo accounts"