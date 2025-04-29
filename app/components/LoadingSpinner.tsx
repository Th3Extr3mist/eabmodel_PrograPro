// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean; // Asegúrate de tener esta prop definida
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = true,
  text = 'Cargando...',
  size = 'md'
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;