import React, { useEffect, useRef } from 'react';
import { ExclamationCircleIcon, BoltIcon, BriefcaseIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface Notification {
  id: number;
  type: 'urgent' | 'alert' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationPopupProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notifications, isOpen, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  
  // Handle touch gestures for mobile
  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      currentY.current = e.touches[0].clientY;
      
      const deltaY = currentY.current - startY.current;
      
      // Only allow dragging down
      if (deltaY > 0) {
        popup.style.transform = `translateY(${deltaY}px)`;
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      if (startY.current === null || currentY.current === null) return;
      
      const deltaY = currentY.current - startY.current;
      
      if (deltaY > 100) {
        // If dragged down more than threshold, close the popup
        onClose();
      } else {
        // Otherwise, reset position
        popup.style.transform = '';
      }
      
      startY.current = null;
      currentY.current = null;
    };
    
    popup.addEventListener('touchstart', handleTouchStart);
    popup.addEventListener('touchmove', handleTouchMove);
    popup.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      popup.removeEventListener('touchstart', handleTouchStart);
      popup.removeEventListener('touchmove', handleTouchMove);
      popup.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);
 
  if (!isOpen) return null;
  
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm sm:hidden z-40"
        onClick={onClose}
      />

      {/* Popup container with responsive positioning - positioned relative to notification bell */}
      <div 
        ref={popupRef}
        className="sm:absolute fixed sm:right-0 sm:top-full mt-0 sm:mt-2 w-full sm:w-80 md:w-96 sm:max-w-sm bg-white rounded-t-lg sm:rounded-lg shadow-lg z-50 transform origin-top-right sm:origin-top-right bottom-0 sm:bottom-auto inset-x-0 sm:inset-auto"
        style={{
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none rounded-full"
            aria-label="Close notifications"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-gray-100 max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {notification.type === 'urgent' && (
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  {notification.type === 'alert' && (
                    <BoltIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  {notification.type === 'info' && (
                    <BriefcaseIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-0.5">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 border-t rounded-b-lg">
          <button 
            className="w-full py-2 text-center text-sm text-accent hover:text-accent/90 font-medium"
          >
            View All Notifications
          </button>
        </div>
        
        {/* Mobile pull indicator */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 sm:hidden">
          <div className="h-1 w-12 bg-gray-300 rounded-full" />
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;