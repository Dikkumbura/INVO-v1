import { type FC } from 'react';

const LoadingScreen: FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-accent mx-auto"></div>
        <p className="mt-4 text-base sm:text-lg font-medium text-gray-900">Preparing your quote request...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;