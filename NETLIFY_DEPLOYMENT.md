# Netlify Deployment Guide

This site is configured and ready to deploy to Netlify!

## 🚀 Quick Deploy (5 minutes)

### Option 1: Deploy via Netlify UI (Easiest)

1. **Push your code to GitHub** (already done!)

2. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"

3. **Connect to GitHub:**
   - Select GitHub
   - Choose repository: `webstercharly/personal-site`
   - Choose branch: `main` (or your production branch)

4. **Configure build settings** (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

5. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add these if using giscus comments:
     ```
     PUBLIC_GISCUS_REPO = webstercharly/personal-site
     PUBLIC_GISCUS_REPO_ID = [get from giscus.app]
     PUBLIC_GISCUS_CATEGORY = Blog Comments
     PUBLIC_GISCUS_CATEGORY_ID = [get from giscus.app]
     ```

6. **Done!** Your site will be live at `https://[random-name].netlify.app`

---

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

---

## 🔧 What's Already Configured

### ✅ Build Settings (`netlify.toml`)
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- Automatic asset optimization

### ✅ Security Headers (`public/_headers`)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (camera, geolocation, etc.)
- XSS Protection

### ✅ Caching Strategy
- HTML: No cache (always fresh)
- Images: 1 year cache (immutable)
- CSS/JS: 1 year cache (immutable)
- RSS: 1 hour cache
- Sitemap: 1 day cache

### ✅ 404 Handling
- Custom 404 page at `/404.html`
- Automatic redirect for all 404s

### ✅ Asset Optimization
- CSS minification
- JS minification
- Image compression
- Pretty URLs (no .html extension)

---

## 🌐 Custom Domain Setup

After deploying:

1. **Go to Site settings → Domain management**
2. **Click "Add custom domain"**
3. **Enter your domain** (e.g., `charlywebster.com`)
4. **Follow DNS instructions:**
   - Add A record or CNAME as instructed
   - Netlify provides DNS or you can use your registrar

5. **Enable HTTPS** (automatic via Let's Encrypt)
   - Goes to Domain settings → HTTPS
   - Click "Verify DNS configuration"
   - Certificate issued automatically

---

## 🔐 Environment Variables (Optional)

If you want to use giscus comments:

1. Visit https://giscus.app/
2. Enable Discussions on your GitHub repo
3. Get configuration values
4. Add to Netlify:
   ```
   Site settings → Environment variables → Add variable
   ```

Required variables:
- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY`
- `PUBLIC_GISCUS_CATEGORY_ID`

---

## 📊 Post-Deployment Checklist

After your site is live:

### Required:
- [ ] Visit your site - verify it loads
- [ ] Test dark mode toggle
- [ ] Check /blog page loads
- [ ] Click on a blog post
- [ ] Test 404 page (visit /nonexistent)
- [ ] Verify HTTPS is working (green lock icon)

### Recommended:
- [ ] Test on mobile device
- [ ] Run Lighthouse audit (should be 95+)
- [ ] Test keyboard navigation (Tab key)
- [ ] Verify fonts load correctly
- [ ] Test social links work
- [ ] Check RSS feed: `yoursite.com/rss.xml`
- [ ] Verify sitemap: `yoursite.com/sitemap-index.xml`
- [ ] Submit sitemap to Google Search Console

### SEO Setup:
- [ ] Add site to Google Search Console
- [ ] Submit sitemap
- [ ] Verify structured data with [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Set up Google Analytics (optional)
- [ ] Add site to Bing Webmaster Tools (optional)

---

## 🎯 Netlify Features You Get

### Included Free:
- ✅ **100GB bandwidth/month**
- ✅ **Automatic HTTPS** (Let's Encrypt)
- ✅ **Instant cache invalidation**
- ✅ **Deploy previews** (for PRs)
- ✅ **Rollback to any deploy**
- ✅ **CDN** (global edge network)
- ✅ **Continuous deployment** (auto-deploy on git push)

### Useful Features:
- **Deploy Previews:** Every PR gets a preview URL
- **Branch Deploys:** Test staging branches
- **Instant Rollback:** One-click rollback to previous version
- **Analytics:** Built-in analytics (optional upgrade)
- **Forms:** Built-in form handling (if you add forms)

---

## 🔄 Continuous Deployment

Already configured! Every time you push to your main branch:
1. Netlify detects the push
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys to production
5. Invalidates cache
6. Site is live in ~2 minutes

---

## 🐛 Troubleshooting

### Build Fails
**Error:** `npm ERR! code ELIFECYCLE`

**Fix:** Check build logs in Netlify UI
- Ensure Node version is 18 (configured in netlify.toml)
- Check for missing dependencies
- Run `npm run build` locally first

---

### Fonts Not Loading
**Issue:** Fonts look different

**Fix:**
- Clear browser cache
- Check `/fonts/` directory exists in deploy
- Verify `@fontsource` packages in package.json

---

### 404 Page Not Showing
**Issue:** Getting default Netlify 404

**Fix:**
- Verify `/404.html` is in build output
- Check netlify.toml redirect rules
- Rebuild and deploy

---

### Giscus Comments Not Loading
**Issue:** Comments section says "not configured"

**Fix:**
- Add environment variables in Netlify
- Get values from https://giscus.app/
- Redeploy site after adding variables

---

## 📈 Performance Tips

### Already Optimized:
- ✅ Self-hosted fonts (no Google CDN)
- ✅ Lazy loading images
- ✅ Minified CSS/JS
- ✅ Image compression
- ✅ Asset caching (1 year)
- ✅ CDN distribution

### Future Optimizations:
- Use WebP images (or Netlify Image CDN)
- Add service worker for offline support
- Implement font preloading
- Add resource hints (dns-prefetch, preconnect)

---

## 🎉 You're All Set!

Your site is configured with:
- ✅ Security headers
- ✅ Asset optimization
- ✅ Caching strategy
- ✅ Custom 404 page
- ✅ HTTPS ready
- ✅ Continuous deployment

Just push to GitHub and Netlify will deploy automatically!

---

## 📞 Need Help?

- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Support:** https://answers.netlify.com/
- **Astro Docs:** https://docs.astro.build/
- **Your Code Review:** See CODE_REVIEW.md in this repo

---

## 🚀 Quick Deploy Command

```bash
# If you haven't already, push to GitHub
git push origin main

# Or deploy directly via CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**That's it!** Your site will be live in minutes! 🎉
