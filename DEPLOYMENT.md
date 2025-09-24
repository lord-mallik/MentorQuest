# MentorQuest Deployment Guide

Complete guide for deploying MentorQuest to production using free hosting services.

## 🎯 Quick Deploy

```bash
npm run deploy
```

This automated script handles the entire deployment process including environment validation, testing, building, and deploying to Vercel.

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Supabase project created and configured
- [ ] Database migrations run successfully
- [ ] Demo data seeded
- [ ] Environment variables configured
- [ ] Application tested locally

### ✅ Code Quality
- [ ] All tests passing (`npm test`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Database migrations tested (`npm run test:migrations`)

### ✅ Production Configuration
- [ ] Production Supabase project set up
- [ ] Authentication URLs configured
- [ ] RLS policies active and tested
- [ ] API keys secured

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Automated Deployment
```bash
npm run deploy
```

#### Manual Deployment
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_HUGGINGFACE_API_KEY production
   vercel env add VITE_LIBRETRANSLATE_API_URL production
   vercel env add VITE_APP_NAME production
   vercel env add VITE_APP_VERSION production
   ```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  }
}
```

### Option 2: Netlify

#### Deploy via Git
1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

#### Deploy via CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "scripts": {
    "deploy:gh": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/mentorquest"
}
```

Deploy:
```bash
npm run build
npm run deploy:gh
```

## 🗄️ Database Deployment (Supabase)

### Production Database Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project for production
   - Choose appropriate region
   - Set strong database password

2. **Run Migrations**
   ```bash
   # Using Supabase Dashboard (Recommended)
   # 1. Go to SQL Editor
   # 2. Run supabase/migrations/000_idempotent_schema.sql
   # 3. Run supabase/seed/seed-safe.sql
   
   # Or using psql
   export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   npm run db:migrate
   npm run db:seed
   ```

3. **Configure Authentication**
   - Set Site URL: `https://your-domain.com`
   - Configure redirect URLs
   - Enable email confirmation (optional)
   - Set up custom SMTP (optional)

4. **Security Configuration**
   - Review RLS policies
   - Test with demo accounts
   - Configure API rate limits
   - Set up database backups

### Environment Variables

#### Required Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

#### Optional Variables
```env
VITE_HUGGINGFACE_API_KEY=your-huggingface-key
VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de
VITE_APP_NAME=MentorQuest
VITE_APP_VERSION=1.0.0
```

## 🔒 Security Configuration

### Frontend Security
1. **Environment Variables**
   - Never commit secrets to Git
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" content="
     default-src 'self';
     script-src 'self' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https:;
     connect-src 'self' https://*.supabase.co https://api-inference.huggingface.co;
   ">
   ```

### Backend Security
1. **Row Level Security**
   - Verify all RLS policies are active
   - Test with different user roles
   - Monitor for policy violations

2. **API Security**
   - Use anon key for client-side
   - Keep service role key secure
   - Monitor API usage

## 📊 Monitoring & Analytics

### Application Monitoring
1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views and performance
   - Track Core Web Vitals

2. **Error Tracking**
   ```bash
   npm install @sentry/react
   ```

   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: "production"
   });
   ```

### Database Monitoring
1. **Supabase Dashboard**
   - Monitor database performance
   - Track API usage
   - Review authentication logs

2. **Custom Monitoring**
   ```sql
   -- Monitor active users
   SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > now() - interval '24 hours';
   
   -- Monitor quiz attempts
   SELECT COUNT(*) FROM quiz_attempts WHERE completed_at > now() - interval '24 hours';
   ```

## 🚀 Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  }
})
```

### Database Optimization
1. **Indexes** (already included in migration)
2. **Connection Pooling** (handled by Supabase)
3. **Query Optimization**
   ```sql
   -- Use EXPLAIN ANALYZE to optimize queries
   EXPLAIN ANALYZE SELECT * FROM quiz_attempts WHERE student_id = $1;
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing in Production

### Smoke Tests
```bash
# Test critical paths
curl -f https://your-domain.com/
curl -f https://your-domain.com/auth
curl -f https://your-domain.com/dashboard
```

### User Acceptance Testing
1. **Demo Account Testing**
   - Login with `teacher@demo.com`
   - Login with `student@demo.com`
   - Test core functionality

2. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

3. **Performance Testing**
   - Lighthouse audit (aim for 90+ scores)
   - Core Web Vitals
   - Load testing with multiple users

## 📋 Post-Deployment Checklist

### ✅ Immediate Verification
- [ ] Application loads successfully
- [ ] Demo accounts work
- [ ] Database connections active
- [ ] Authentication flow works
- [ ] Core features functional

### ✅ Performance Verification
- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

### ✅ Security Verification
- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] No sensitive data exposed
- [ ] API keys secured

### ✅ Monitoring Setup
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Database monitoring active
- [ ] Uptime monitoring set up

## 🆘 Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .next
npm install
npm run build
```

**Environment Variable Issues**
- Ensure variables start with `VITE_`
- Check for typos in variable names
- Verify values are properly set

**Database Connection Issues**
- Check Supabase project status
- Verify URL and keys
- Test connection from local environment

**Authentication Issues**
- Configure site URLs in Supabase
- Check redirect URLs
- Verify email templates

### Performance Issues
1. **Slow Loading**
   - Optimize images and assets
   - Enable compression
   - Use CDN for static assets

2. **Database Slow Queries**
   - Check query performance in Supabase
   - Add missing indexes
   - Optimize complex queries

## 📈 Scaling Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month

### Upgrade Planning
1. **Monitor Usage**
   - Track bandwidth and storage
   - Monitor database connections
   - Watch API request counts

2. **Optimization Before Scaling**
   - Optimize images and assets
   - Implement caching
   - Reduce API calls

3. **Paid Tier Benefits**
   - Higher limits
   - Better performance
   - Advanced features
   - Priority support

## 🎯 Success Metrics

### Technical Metrics
- 99%+ uptime
- < 3s page load time
- < 1% error rate
- 90+ Lighthouse score

### User Metrics
- Successful user registrations
- Demo account usage
- Feature engagement
- User retention

---

**Deployment Complete!** 🎉

Your MentorQuest application is now live and ready to help students learn around the world!