import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'color', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const iconColorClasses = {
    light: 'text-white',
    dark: 'text-gray-800',
    color: 'text-blue-600'
  };

  const textColorClasses = {
    light: 'text-white',
    dark: 'text-gray-800',
    color: 'text-gray-800'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
        {/* Blindfold pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
        <div className="relative flex items-center">
          <EyeOff className={`${variant === 'light' ? 'text-white' : 'text-white'} ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} opacity-80`} />
          <Eye className={`${variant === 'light' ? 'text-white' : 'text-white'} ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} ml-1 opacity-60`} />
        </div>
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold ${textColorClasses[variant]} leading-tight`}>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BlindsCloud
            </span>
          </h1>
          {size !== 'sm' && (
            <p className={`text-xs ${variant === 'light' ? 'text-blue-100' : 'text-indigo-600'} font-medium`}>
              Blindfold Solutions
            </p>
          )}
        </div>
      )}
    </div>
  );
}