// Domain and API configuration
export const CONFIG = {
  // Your custom domain configuration
  DOMAIN: {
    PRODUCTION: 'blindscloud-frontend.onrender.com',
    STAGING: 'blindscloud-frontend-staging.onrender.com',
    DEVELOPMENT: 'localhost:5173'
  },
  
  // API endpoints for different environments
  API: {
    PRODUCTION: 'https://blindscloud-backend.onrender.com',
    STAGING: 'https://blindscloud-backend-staging.onrender.com',
    DEVELOPMENT: 'http://localhost:3001'
  },
  
  // Email configuration
  EMAIL: {
    FROM_NAME: 'BlindsCloud',
    FROM_EMAIL: 'noreply@gmail.com',
    SUPPORT_EMAIL: 'support@gmail.com',
    SMTP_HOST: 'smtp.gmail.com'
  },
  
  // App configuration
  APP: {
    NAME: 'BlindsCloud',
    DESCRIPTION: 'Professional Blinds Business Management Platform',
    VERSION: '1.3.0'
  }
};

// Get current environment
export const getEnvironment = (): 'production' | 'staging' | 'development' => {
  const hostname = window.location.hostname;
  
  if (hostname === CONFIG.DOMAIN.PRODUCTION) return 'production';
  if (hostname === CONFIG.DOMAIN.STAGING) return 'staging';
  return 'development';
};

// Get API URL for current environment
export const getApiUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to config based on environment
  const env = getEnvironment();
  switch (env) {
    case 'production': return `${CONFIG.API.PRODUCTION}/api`;
    case 'staging': return `${CONFIG.API.STAGING}/api`;
    default: return `${CONFIG.API.DEVELOPMENT}/api`;
  }
};

// Get frontend URL for current environment
export const getFrontendUrl = (): string => {
  const env = getEnvironment();
  const protocol = window.location.protocol;
  
  switch (env) {
    case 'production': return `${protocol}//${CONFIG.DOMAIN.PRODUCTION}`;
    case 'staging': return `${protocol}//${CONFIG.DOMAIN.STAGING}`;
    default: return `${protocol}//${CONFIG.DOMAIN.DEVELOPMENT}`;
  }
};

// Check if we're in production
export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};

// Get email configuration
export const getEmailConfig = () => {
  return {
    fromName: CONFIG.EMAIL.FROM_NAME,
    fromEmail: CONFIG.EMAIL.FROM_EMAIL,
    supportEmail: CONFIG.EMAIL.SUPPORT_EMAIL,
    smtpHost: CONFIG.EMAIL.SMTP_HOST
  };
};