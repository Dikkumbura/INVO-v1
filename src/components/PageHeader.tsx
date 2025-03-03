import React from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from './BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton: showBackButtonProp 
}) => {
  const location = useLocation();
  const showBackButton = showBackButtonProp !== undefined 
    ? showBackButtonProp 
    : location.pathname !== '/';

  return (
    <div className="mb-8 flex items-center">
      <div className="flex items-center space-x-4">
        {showBackButton && <BackButton />}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;