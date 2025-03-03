import { type FC } from 'react';
import clsx from 'clsx';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isVisible, message = 'Processing your request...' }) => {
  return (
    <div
      className={clsx(
        'fixed inset-0 bg-white/70 backdrop-blur-sm transition-opacity duration-300',
        'flex items-center justify-center z-50',
        {
          'opacity-0 pointer-events-none': !isVisible,
          'opacity-100': isVisible
        }
      )}
      aria-hidden={!isVisible}
      role="status"
      aria-label="Loading"
    >
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
        <p className="mt-4 text-base sm:text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;