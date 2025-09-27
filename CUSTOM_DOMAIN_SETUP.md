# 🌐 Custom Domain Setup Guide - BlindsCloud Platform

## 📋 **Complete Domain Configuration**

### **🎯 Your Domain Structure**
- **Main Site**: `https://blindscloud.co.uk`
- **API Backend**: `https://api.blindscloud.co.uk`
- **Email**: `admin@blindscloud.co.uk`

---

## 🚀 **Step 1: DNS Configuration**

### **A. Main Domain Records**
Add these DNS records in your domain registrar:

```dns
# Main website
A     @              76.76.19.61
A     www            76.76.19.61

# API subdomain
CNAME api            your-backend-service.onrender.com

# Email (if using custom email)
MX    @              10 mail.blindscloud.co.uk
A     mail           [Your email server IP]

# Optional subdomains
CNAME staging        your-staging-service.onrender.com
CNAME admin          your-admin-panel.onrender.com
```

### **B. SSL Certificate**
- ✅ **Automatic SSL** via Render/Netlify
- ✅ **Let's Encrypt** certificates
- ✅ **HTTPS redirect** configured

---

## 🔧 **Step 2: Render Deployment Configuration**

### **A. Frontend Service (blindscloud.co.uk)**
1. **Create Static Site on Render:**
   - Name: `blindscloud-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables:**
   ```
   VITE_API_URL=https://api.blindscloud.co.uk/api
   VITE_SUPABASE_URL=[Your Supabase URL]
   VITE_SUPABASE_ANON_KEY=[Your Supabase Key]
   ```

3. **Custom Domain:**
   - Add `blindscloud.co.uk`
   - Add `www.blindscloud.co.uk`

### **B. Backend Service (api.blindscloud.co.uk)**
1. **Create Web Service on Render:**
   - Name: `blindscloud-backend`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=[Your PostgreSQL URL]
   JWT_SECRET=[Generate 32+ character secret]
   FRONTEND_URL=https://blindscloud.co.uk
   SMTP_HOST=mail.blindscloud.co.uk
   SMTP_USER=admin@blindscloud.co.uk
   SMTP_PASS=[Your email password]
   DOMAIN_NAME=blindscloud.co.uk
   API_SUBDOMAIN=api.blindscloud.co.uk
   ```

3. **Custom Domain:**
   - Add `api.blindscloud.co.uk`

### **C. Database Service**
1. **Create PostgreSQL on Render:**
   - Name: `blindscloud-database`
   - Database: `blindscloud_db`
   - User: `blindscloud_user`

---

## 📧 **Step 3: Email Configuration**

### **A. SMTP Setup (Recommended)**
Use your domain's email service:

```env
SMTP_HOST=mail.blindscloud.co.uk
SMTP_PORT=587
SMTP_USER=admin@blindscloud.co.uk
SMTP_PASS=your_email_password
SMTP_FROM=admin@blindscloud.co.uk
```

### **B. Alternative Email Services**
- **SendGrid**: Professional email delivery
- **AWS SES**: Scalable email service
- **Mailgun**: Developer-friendly email API

---

## 🔒 **Step 4: Security Configuration**

### **A. HTTPS Enforcement**
```apache
# .htaccess (if using Apache)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **B. Security Headers**
Already configured in backend:
- ✅ **CORS** for your domain
- ✅ **Helmet** security headers
- ✅ **Rate limiting**
- ✅ **JWT authentication**

---

## 🎯 **Step 5: Environment-Specific Configuration**

### **A. Production Environment**
```env
# Frontend (.env.production)
VITE_API_URL=https://api.blindscloud.co.uk/api
VITE_APP_NAME=BlindsCloud
VITE_APP_DOMAIN=blindscloud.co.uk

# Backend (.env.production)
NODE_ENV=production
FRONTEND_URL=https://blindscloud.co.uk
DOMAIN_NAME=blindscloud.co.uk
API_SUBDOMAIN=api.blindscloud.co.uk
```

### **B. Development Environment**
```env
# Frontend (.env.development)
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=BlindsCloud (Dev)
VITE_APP_DOMAIN=localhost

# Backend (.env.development)
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📱 **Step 6: Mobile & PWA Configuration**

### **A. PWA Manifest**
```json
{
  "name": "BlindsCloud",
  "short_name": "BlindsCloud",
  "start_url": "https://blindscloud.co.uk",
  "display": "standalone",
  "background_color": "#1e293b",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### **B. Service Worker**
```javascript
// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 🔄 **Step 7: Data Migration**

### **A. Domain Change Migration**
The platform automatically handles domain changes:
- ✅ **Data migration** from old domains
- ✅ **Session preservation** across domain changes
- ✅ **Automatic fallback** to localStorage

### **B. Database Migration**
```sql
-- Run this if migrating from localStorage to database
INSERT INTO users (id, email, name, role, business_id, permissions, is_active)
SELECT * FROM localStorage_users_backup;
```

---

## 🎮 **Step 8: Testing Your Custom Domain**

### **A. Frontend Testing**
1. **Visit**: `https://blindscloud.co.uk`
2. **Login**: Use demo accounts
3. **Test Features**: AR camera, 3D models, user management
4. **Mobile Test**: Verify responsive design

### **B. Backend Testing**
1. **API Health**: `https://api.blindscloud.co.uk/health`
2. **Authentication**: Test login/logout
3. **CRUD Operations**: Create users, jobs, customers
4. **File Uploads**: Test image and document uploads

### **C. Email Testing**
1. **Create User**: Should send welcome email
2. **Password Reset**: Should send reset email
3. **Check Delivery**: Verify emails arrive correctly

---

## 🛠️ **Step 9: Advanced Configuration**

### **A. CDN Setup (Optional)**
```javascript
// Use CDN for static assets
const CDN_URL = 'https://cdn.blindscloud.co.uk';
```

### **B. Analytics Integration**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### **C. Monitoring Setup**
- **Uptime monitoring** for blindscloud.co.uk
- **API monitoring** for api.blindscloud.co.uk
- **Error tracking** with Sentry or similar

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. CORS Errors**
```
Error: Access to fetch at 'https://api.blindscloud.co.uk' from origin 'https://blindscloud.co.uk' has been blocked by CORS policy
```
**Solution**: Verify CORS_ORIGINS environment variable includes your domain

**2. SSL Certificate Issues**
```
Error: NET::ERR_CERT_AUTHORITY_INVALID
```
**Solution**: Wait for SSL propagation (up to 24 hours) or check DNS configuration

**3. API Connection Failed**
```
Error: Failed to fetch from API
```
**Solution**: Check API subdomain DNS and backend deployment status

**4. Email Delivery Issues**
```
Error: SMTP connection failed
```
**Solution**: Verify SMTP credentials and server configuration

---

## 📊 **Step 10: Performance Optimization**

### **A. Frontend Optimization**
- ✅ **Code splitting** with Vite
- ✅ **Asset optimization** and compression
- ✅ **Lazy loading** for better performance
- ✅ **CDN delivery** via Render

### **B. Backend Optimization**
- ✅ **Database indexing** for fast queries
- ✅ **Connection pooling** for PostgreSQL
- ✅ **Gzip compression** for API responses
- ✅ **Rate limiting** for security

### **C. Database Optimization**
- ✅ **Proper indexes** on frequently queried columns
- ✅ **Foreign key constraints** for data integrity
- ✅ **Row Level Security** for multi-tenant isolation

---

## 🎉 **Final Checklist**

### **✅ Domain Setup**
- [ ] DNS records configured
- [ ] SSL certificates active
- [ ] Subdomains pointing correctly

### **✅ Deployment**
- [ ] Frontend deployed to blindscloud.co.uk
- [ ] Backend deployed to api.blindscloud.co.uk
- [ ] Database connected and migrated

### **✅ Email System**
- [ ] SMTP configured for blindscloud.co.uk
- [ ] Welcome emails working
- [ ] Password reset emails working

### **✅ Testing**
- [ ] All demo accounts working
- [ ] CRUD operations functional
- [ ] AR camera working with HTTPS
- [ ] Mobile responsiveness verified

---

## 🔗 **Quick Deploy Commands**

### **Deploy to Render with Custom Domain**
```bash
# 1. Push to GitHub
git add .
git commit -m "Configure custom domain: blindscloud.co.uk"
git push origin main

# 2. Deploy on Render
# - Connect GitHub repository
# - Add custom domains in Render dashboard
# - Configure environment variables

# 3. Update DNS
# - Point blindscloud.co.uk to Render
# - Point api.blindscloud.co.uk to backend service
```

---

## 🏆 **Your Custom Domain is Ready!**

After following this guide, you'll have:

### **🌐 Live URLs**
- **Main Site**: `https://blindscloud.co.uk`
- **API Backend**: `https://api.blindscloud.co.uk`
- **Admin Panel**: `https://blindscloud.co.uk/admin`

### **✅ Professional Features**
- 🏢 **Custom branding** with your domain
- 📧 **Professional emails** from @blindscloud.co.uk
- 🔒 **SSL security** with HTTPS
- 📱 **Mobile-optimized** experience
- 🎯 **SEO-ready** with proper meta tags

### **🚀 Enterprise Ready**
- 💾 **PostgreSQL database** for scalability
- 🔐 **JWT authentication** for security
- 📊 **Activity logging** for compliance
- 🌐 **Global CDN** for performance

**Your BlindsCloud platform is now ready for production use with your custom domain!**

---

*Need help? Contact support at support@blindscloud.co.uk*