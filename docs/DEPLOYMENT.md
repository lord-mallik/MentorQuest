# MentorQuest Deployment Guide

This guide covers deploying MentorQuest to production environments using free hosting services.

## Overview

MentorQuest uses a modern architecture that's easy to deploy:
- **Frontend**: React SPA that can be deployed to any static hosting service
- **Backend**: Supabase handles all backend functionality (database, auth, real-time)
- **AI Services**: External APIs (HuggingFace, LibreTranslate) - no deployment needed

## Prerequisites

Before deploying, ensure you have:
- A working local development environment
- A Supabase project with the database schema set up
- Your environment variables configured
- The application tested locally

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers excellent React support with automatic deployments from Git.

#### Setup Steps:

1. **Prepare your repository:**
```bash
# Ensure your code is committed and pushed to GitHub/GitLab/Bitbucket
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your Git provider
   - Click "New Project"
   - Import your MentorQuest repository
   - Configure build settings:
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set Environment Variables:**
   In your Vercel project settings, add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_HUGGINGFACE_API_KEY=your-key (optional)
   VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de
   VITE_APP_NAME=MentorQuest
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a URL like `https://mentorquest.vercel.app`

#### Automatic Deployments:
Vercel will automatically redeploy when you push to your main branch.

### Option 2: Netlify

Netlify is another excellent option for React apps.

#### Setup Steps:

1. **Build your app locally:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag and drop your `dist` folder to deploy
   - Or connect your Git repository for automatic deployments

3. **Configure Environment Variables:**
   In Site Settings → Environment Variables, add the same variables as above.

4. **Set up redirects for SPA:**
   Create a `public/_redirects` file:
   ```
   /*    /index.html   200
   ```

### Option 3: GitHub Pages

For a completely free option using GitHub Pages:

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Add deploy script to package.json:**
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/mentorquest"
}
```

3. **Deploy:**
```bash
npm run build
npm run deploy
```

## Backend Setup (Supabase)

Your backend is already deployed when you set up Supabase! However, ensure:

### Production Database Setup:

1. **Run Migrations:**
   - In your Supabase dashboard, go to SQL Editor
   - Run your migration files in order
   - Verify all tables and policies are created

2. **Configure Authentication:**
   - Go to Authentication → Settings
   - Set up your site URL: `https://your-domain.com`
   - Configure redirect URLs for auth flows

3. **Set up Row Level Security:**
   - Ensure all RLS policies are active
   - Test with different user roles

4. **Configure CORS:**
   - Add your domain to allowed origins
   - Usually automatic with Supabase

### Environment Variables for Production:

Update your frontend environment variables with production values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Custom Domain Setup

### For Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### For Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records as instructed

## SSL/HTTPS

Both Vercel and Netlify provide automatic HTTPS certificates. No additional configuration needed.

## Performance Optimization

### Build Optimization:

1. **Optimize bundle size:**
```bash
npm run build -- --analyze
```

2. **Enable compression:**
   Most hosting services enable gzip/brotli automatically.

3. **Configure caching:**
   Set up proper cache headers for static assets.

### Supabase Optimization:

1. **Database Indexes:**
   Ensure all necessary indexes are created (included in migrations).

2. **Connection Pooling:**
   Supabase handles this automatically.

3. **CDN:**
   Supabase includes CDN for global performance.

## Monitoring and Analytics

### Frontend Monitoring:

1. **Vercel Analytics:**
   - Enable in your Vercel dashboard
   - Track page views and performance

2. **Google Analytics:**
   Add to your `index.html`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

### Backend Monitoring:

1. **Supabase Dashboard:**
   - Monitor database performance
   - Track API usage
   - View real-time connections

2. **Error Tracking:**
   Consider integrating Sentry for error tracking:
   ```bash
   npm install @sentry/react
   ```

## Security Considerations

### Frontend Security:

1. **Environment Variables:**
   - Never commit sensitive keys to Git
   - Use different keys for development/production
   - Rotate keys regularly

2. **Content Security Policy:**
   Add CSP headers via your hosting provider.

### Backend Security:

1. **Row Level Security:**
   - Ensure all tables have proper RLS policies
   - Test with different user roles
   - Regularly audit permissions

2. **API Keys:**
   - Use separate Supabase projects for dev/prod
   - Monitor API usage for anomalies
   - Set up usage alerts

## Backup and Recovery

### Database Backups:

Supabase automatically backs up your database, but you can also:

1. **Manual Backups:**
```sql
-- Export data via SQL Editor
SELECT * FROM users;
-- Save results as CSV
```

2. **Automated Backups:**
   Set up scheduled backups via Supabase CLI or custom scripts.

### Code Backups:

1. **Git Repository:**
   - Keep your code in version control
   - Use multiple remotes for redundancy
   - Tag releases for easy rollback

## Scaling Considerations

### Frontend Scaling:

Static hosting scales automatically, but consider:
- CDN for global users
- Image optimization
- Code splitting for large apps

### Backend Scaling:

Supabase handles scaling, but monitor:
- Database connections
- API rate limits
- Storage usage

### Upgrade Paths:

When you outgrow free tiers:
1. **Vercel Pro:** $20/month for team features
2. **Netlify Pro:** $19/month for advanced features  
3. **Supabase Pro:** $25/month for higher limits

## Troubleshooting Deployment Issues

### Common Frontend Issues:

1. **Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

2. **Environment Variable Issues:**
   - Ensure all required variables are set
   - Check variable names (must start with VITE_)
   - Restart deployment after changes

3. **Routing Issues:**
   - Ensure SPA redirects are configured
   - Check that all routes are properly defined

### Common Backend Issues:

1. **Database Connection:**
   - Verify Supabase URL and keys
   - Check if project is paused (free tier)
   - Ensure RLS policies allow access

2. **Authentication Issues:**
   - Configure correct site URLs
   - Check redirect URLs
   - Verify email templates

### Performance Issues:

1. **Slow Loading:**
   - Optimize images and assets
   - Enable compression
   - Use lazy loading

2. **Database Slow Queries:**
   - Check query performance in Supabase
   - Add missing indexes
   - Optimize complex queries

## Maintenance

### Regular Tasks:

1. **Update Dependencies:**
```bash
npm update
npm audit fix
```

2. **Monitor Performance:**
   - Check Vercel/Netlify analytics
   - Monitor Supabase usage
   - Review error logs

3. **Security Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Rotate API keys periodically

### Backup Procedures:

1. **Weekly Database Export:**
   - Export critical data
   - Store in secure location
   - Test restore procedures

2. **Code Backups:**
   - Ensure Git history is preserved
   - Tag stable releases
   - Document deployment procedures

## Cost Management

### Free Tier Limits:

**Vercel:**
- 100GB bandwidth/month
- 100 deployments/day
- Custom domains included

**Netlify:**
- 100GB bandwidth/month
- 300 build minutes/month
- Custom domains included

**Supabase:**
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users

### Monitoring Usage:

1. Set up usage alerts in each service
2. Monitor bandwidth and storage usage
3. Optimize assets and queries to stay within limits

### Upgrade Planning:

Plan upgrades when approaching limits:
- Monitor growth trends
- Budget for paid tiers
- Consider optimization before upgrading

This deployment guide should help you successfully deploy MentorQuest to production. Remember to test thoroughly in a staging environment before deploying to production!