# VAGS Blockchain - Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository
- Supabase database setup completed

## Environment Variables for Vercel

When deploying to Vercel, add these environment variables in your Vercel dashboard:

### Required Environment Variables:
```
VITE_SUPABASE_URL=https://ukculrgndvkcufbuzqdc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrY3VscmduZHZrY3VmYnV6cWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTQxMTIsImV4cCI6MjA4NDM3MDExMn0.Iy-6M9nHOm-MJnhD1iLnoTZtH9dclCEc94Q-o8Fnz74
TELEGRAM_BOT_TOKEN=8360297293:AAH8uHoBVMe09D5RguuRMRHb5_mcB3k7spo
TELEGRAM_CHAT_ID=@gsc_vags_bot
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Settings > Environment Variables
4. Deploy

### 3. Verify Deployment
- Check that the site loads correctly
- Test admin panel functionality (footer > admin link)
- Verify Supabase connection works
- Test blockchain file upload

## Admin Panel Access (Production)
1. Go to your deployed site
2. Scroll to footer
3. Click small "admin" link under Product section

### ✅ Telegram Bot Integration
- **Transaction Broadcasting**: @gsc_vags_bot receives JSON transaction data
- **Ambassador Applications**: @gscambassador_bot receives form submissions
- **Newsletter Subscriptions**: Dual notification (Telegram + Email)

### ✅ API Configurations
- **CORS Headers**: Configured for cross-origin requests
- **Security Headers**: X-Frame-Options, Content-Type protection
- **Cache Optimization**: Static assets cached for 1 year

### ✅ Blockchain Functionality
- **Wallet Management**: Create, import, backup wallets
- **Transaction Processing**: Send/receive GSC with network broadcasting
- **Supabase Integration**: Real-time blockchain data synchronization
- **Local Storage**: Persistent wallet and blockchain data

## 🌐 Deployment Platforms

### Vercel (Primary)
- Uses `vercel.json` configuration
- Automatic HTTPS and CDN
- Environment variables via dashboard
- Zero-config deployment

### Netlify (Alternative)
- Uses `netlify.toml` configuration
- Form handling for contact forms
- Branch previews available

## 🔍 Post-Deployment Verification

### Critical Tests:
1. **Homepage loads** with proper branding
2. **Wallet functionality** - create/import wallets
3. **Transaction broadcasting** - check @gsc_vags_bot receives JSON
4. **Ambassador form** - verify @gscambassador_bot gets applications
5. **Newsletter subscription** - test dual notifications
6. **Blockchain refresh** - Supabase data synchronization
7. **Mobile responsiveness** - all sections accessible

### API Endpoints to Test:
- `https://api.telegram.org/bot[TOKEN]/getMe` - Bot validation
- `https://api.telegram.org/bot[TOKEN]/sendMessage` - Message sending
- Supabase connection and data retrieval

## 🛠️ Production Optimizations

### Performance:
- **Bundle splitting** - Automatic code splitting
- **Asset optimization** - Images and fonts optimized
- **Caching strategy** - Static assets cached aggressively

### Security:
- **Environment variables** - Sensitive data in env vars
- **CORS configuration** - Proper cross-origin handling
- **Content Security Policy** - XSS protection

### Monitoring:
- **Console logging** - Production-safe error logging
- **Error boundaries** - Graceful error handling
- **Fallback mechanisms** - Email backup for failed API calls

## 🚨 Troubleshooting

### Common Issues:
1. **Telegram API fails**: Check bot tokens and chat IDs
2. **CORS errors**: Verify _headers file deployed correctly
3. **Environment variables**: Ensure all VITE_ prefixed vars are set
4. **Build failures**: Check for TypeScript errors in unused test files

### Debug Steps:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Test API endpoints directly
4. Confirm environment variables are loaded

## 📞 Support Contacts
- **Technical Issues**: Check browser console logs
- **Bot Configuration**: Verify with @BotFather on Telegram
- **Supabase Issues**: Check project dashboard
