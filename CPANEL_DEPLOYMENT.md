# cPanel Deployment Guide for BlindsCloud Platform

## Quick Start

Your project is built and ready! All files are in the `dist` folder.

---

## Method 1: File Manager (Recommended for Beginners)

### Step 1: Access cPanel
- Go to: `yourdomain.com/cpanel` or `yourdomain.com:2083`
- Login with your hosting credentials

### Step 2: Open File Manager
1. Click **File Manager** icon in cPanel
2. Navigate to `public_html` (root directory of your website)
3. If empty, you're ready. If it has files, delete old ones first

### Step 3: Upload Your Files
1. Click **Upload** button in File Manager toolbar
2. Upload ALL files from the `dist` folder:
   - `index.html`
   - `.htaccess`
   - `assets` folder (entire folder)
3. Wait for upload to complete (green checkmark appears)

### Step 4: Verify File Structure
Your `public_html` should look like:
```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-*.css
    ├── index-*.js
    ├── lucide-*.js
    └── vendor-*.js
```

### Step 5: Set Permissions (Important!)
1. Select all uploaded files
2. Right-click → **Change Permissions**
3. Set:
   - Files: **644**
   - Folders: **755**
4. Check "Recurse into subdirectories"
5. Click **Change Permissions**

---

## Method 2: FTP Upload (Faster)

### Step 1: Get FTP Credentials
In cPanel → **FTP Accounts**:
- FTP Server: `ftp.yourdomain.com`
- Username: (your FTP username)
- Password: (your FTP password)
- Port: 21 (or 22 for SFTP)

### Step 2: Download FTP Client
- **FileZilla** - https://filezilla-project.org/ (Free)
- **WinSCP** - https://winscp.net/ (Windows)
- **Cyberduck** - https://cyberduck.io/ (Mac)

### Step 3: Connect & Upload
1. Open your FTP client
2. Enter connection details
3. Connect to server
4. Navigate to `public_html` folder
5. Drag ALL files from `dist` folder to `public_html`

---

## Method 3: ZIP Upload (Best for Slow Connections)

### Step 1: Create ZIP File
1. Go to the `dist` folder
2. Select all files inside
3. Create a ZIP file (name it `website.zip`)

### Step 2: Upload ZIP to cPanel
1. In File Manager, go to `public_html`
2. Click **Upload** → Upload `website.zip`
3. After upload, right-click `website.zip` → **Extract**
4. Delete `website.zip` after extraction

---

## Post-Deployment Configuration

### 1. Environment Variables
If using Supabase or external APIs:

**Option A: Create .env file in public_html**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=https://yourdomain.com/api
```

**Option B: Use cPanel Environment Variables**
1. Go to cPanel → **PHP Variables** or **MultiPHP INI Editor**
2. Add your variables

### 2. SSL Certificate (HTTPS)
1. In cPanel → **SSL/TLS Status**
2. Enable AutoSSL or install Let's Encrypt
3. This activates HTTPS (the `.htaccess` will auto-redirect)

### 3. Database Setup (If using Supabase)
Your app is configured for Supabase. Make sure you have:
- Supabase project created at https://supabase.com
- Copy your project URL and anon key
- Update environment variables (see step 1)

---

## Testing Your Deployment

### 1. Visit Your Website
Go to: `https://yourdomain.com`

### 2. Check These Items:
- ✅ Page loads without errors
- ✅ Login form appears
- ✅ No 404 errors in browser console (F12)
- ✅ HTTPS is working (padlock in address bar)

### 3. Test Login
Default admin credentials (from localStorage):
- Email: admin@example.com
- Password: admin123

---

## Troubleshooting

### Problem: "Page Not Found" (404 Error)
**Solution:**
1. Verify `.htaccess` is in `public_html` root
2. Check if mod_rewrite is enabled (ask hosting support)

### Problem: "Mixed Content" Warning
**Solution:**
- Ensure SSL is installed
- All API URLs should use HTTPS

### Problem: Assets Not Loading (CSS/JS)
**Solution:**
1. Check file permissions (644 for files, 755 for folders)
2. Clear browser cache (Ctrl+Shift+R)
3. Check `base: './'` in vite.config.ts (already set)

### Problem: White Screen/Blank Page
**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify all files uploaded correctly

---

## File Checklist

Before considering deployment complete, verify:

- [ ] All files from `dist` folder uploaded
- [ ] `.htaccess` file is in `public_html` root
- [ ] File permissions set correctly (644/755)
- [ ] SSL certificate installed and active
- [ ] Environment variables configured (if needed)
- [ ] Website loads at your domain
- [ ] Login functionality works
- [ ] No console errors in browser

---

## Support & Updates

### To Update Your Site Later:
1. Make changes to source code
2. Run `npm run build`
3. Upload new files from `dist` folder
4. Overwrite existing files in cPanel

### Performance Tips:
- ✅ Compression enabled (via .htaccess)
- ✅ Browser caching configured (via .htaccess)
- ✅ Optimized build with code splitting
- Consider using CloudFlare CDN for better speed

---

## Important Notes

1. **Always keep a backup** of your files before updating
2. **Test locally first** with `npm run dev`
3. **Build before deploying** with `npm run build`
4. **Never upload source files** - only upload the `dist` folder contents

---

## Your Current Configuration

✅ Build completed successfully
✅ Optimized for production
✅ .htaccess configured with:
   - React Router support
   - HTTPS redirect
   - Compression enabled
   - Cache headers
   - Security headers
✅ Base path set to relative (`./`)
✅ All TypeScript errors fixed
✅ Ready for deployment!

---

## Need Help?

- cPanel Documentation: https://docs.cpanel.net/
- FileZilla Guide: https://wiki.filezilla-project.org/
- Contact your hosting support if you have questions about cPanel access
