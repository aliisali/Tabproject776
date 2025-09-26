import React from 'react';
import { Layers } from 'lucide-react';

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
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <Layers className={`${variant === 'light' ? 'text-white' : 'text-white'} ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`} />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizeClasses[size]} font-bold ${textColorClasses[variant]} leading-tight`}>
            BlindsCloud
          </h1>
          {size !== 'sm' && (
            <p className={`text-xs ${variant === 'light' ? 'text-blue-100' : 'text-blue-600'} font-medium`}>
              Business Management
            </p>
          )}
        </div>
      )}
    </div>
  );
}