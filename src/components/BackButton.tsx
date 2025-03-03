import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
  );
}

export default BackButton;