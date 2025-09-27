# 🚀 Super Simple Render Deployment - BlindsCloud

## 📋 **One-Click Deployment Guide**

### **Step 1: Deploy Database**
1. Go to [render.com](https://render.com) → Click "New +"
2. Select "PostgreSQL"
3. **Settings:**
   - Name: `blindscloud-db`
   - Database: `blindscloud`
   - User: `blindscloud_user`
   - Plan: **Free**
4. Click "Create Database"
5. **Copy the External Database URL** (you'll need this)

### **Step 2: Deploy Backend**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **Settings:**
   - Name: `blindscloud-backend`
   - Environment: `Node`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV = production
   DATABASE_URL = [paste your database URL from step 1]
   JWT_SECRET = your-super-secret-key-here-make-it-long
   FRONTEND_URL = https://job-management-platf-ucrc.bolt.host
   SMTP_HOST = mail.blindscloud.co.uk
   SMTP_PORT = 587
   SMTP_USER = admin@blindscloud.co.uk
   SMTP_PASS = your-email-password
   ```

5. Click "Create Web Service"

### **Step 3: Deploy Frontend**
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. **Settings:**
   - Name: `blindscloud-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL = https://blindscloud-backend.onrender.com/api
   ```
   (Replace `blindscloud-backend` with your actual backend service name)

5. Click "Create Static Site"

---

## 🎯 **That's It! Your Platform Will Be Live In 10 Minutes**

### **✅ What You'll Get:**
- **Database:** Permanent PostgreSQL storage
- **Backend:** Full API with authentication
- **Frontend:** Your complete BlindsCloud platform
- **Features:** All AR, 3D models, user management working

### **🔗 Access Your Platform:**
- **Frontend URL:** `https://your-frontend-name.onrender.com`
- **Backend API:** `https://your-backend-name.onrender.com`

### **🎮 Test With Demo Accounts:**
- **Admin:** `admin@blindscloud.co.uk` / `password`
- **Business:** `business@blindscloud.co.uk` / `password`
- **Employee:** `employee@blindscloud.co.uk` / `password`

---

## 🔧 **If You Need Help:**

**Copy these exact values for environment variables:**

**Backend Environment Variables:**
```
NODE_ENV=production
JWT_SECRET=blindscloud-super-secret-jwt-key-2024-very-long-and-secure
FRONTEND_URL=https://job-management-platf-ucrc.bolt.host
SMTP_HOST=mail.blindscloud.co.uk
SMTP_PORT=587
SMTP_USER=admin@blindscloud.co.uk
SMTP_PASS=your-actual-email-password
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://your-backend-service-name.onrender.com/api
```

---

## 🎉 **Done!**
Your BlindsCloud platform will be fully deployed with database backend!