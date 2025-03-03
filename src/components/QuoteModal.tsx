import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const insuranceTypes = [
  "Workers' Comp",
  "General Liability",
  "Commercial Auto",
  "Cyber Liability",
] as const;

const quoteSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  insuranceType: z.enum(insuranceTypes),
  annualRevenue: z.number().min(0, "Annual revenue must be a positive number"),
  employeeCount: z.number().min(1, "Must have at least one employee"),
  businessLocation: z.string().min(1, "Business location is required"),
  contactEmail: z.string().email("Invalid email address"),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({
    insuranceType: insuranceTypes[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    try {
      const validatedData = quoteSchema.parse({
        ...formData,
        annualRevenue: formData.annualRevenue ? Number(formData.annualRevenue) : undefined,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : undefined,
      });
      
      // Here you would typically send the data to your backend
      console.log('Form submitted:', validatedData);
      
      // Clear form and close modal
      setFormData({ insuranceType: insuranceTypes[0] });
      setErrors({});
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        setShowError(true);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
      initialFocus={initialFocusRef}
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">
              Get an Instant Quote
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 touch-target"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {showError && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                Please fill in all required fields correctly.
              </div>
            )}

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                ref={initialFocusRef}
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control ${
                  errors.businessName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
              )}
            </div>

            <div>
              <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700">
                Insurance Type *
              </label>
              <select
                id="insuranceType"
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control"
              >
                {insuranceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700">
                Estimated Annual Revenue *
              </label>
              <input
                type="number"
                id="annualRevenue"
                name="annualRevenue"
                value={formData.annualRevenue || ''}
                onChange={handleInputChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control ${
                  errors.annualRevenue ? 'border-red-300' : 'border-gray-300'
                }`}
                inputMode="numeric"
              />
              {errors.annualRevenue && (
                <p className="mt-1 text-sm text-red-600">{errors.annualRevenue}</p>
              )}
            </div>

            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
                Number of Employees *
              </label>
              <input
                type="number"
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount || ''}
                onChange={handleInputChange}
                min="1"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control ${
                  errors.employeeCount ? 'border-red-300' : 'border-gray-300'
                }`}
                inputMode="numeric"
              />
              {errors.employeeCount && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeCount}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700">
                Business Location *
              </label>
              <input
                type="text"
                id="businessLocation"
                name="businessLocation"
                value={formData.businessLocation || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control ${
                  errors.businessLocation ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.businessLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.businessLocation}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm mobile-form-control ${
                  errors.contactEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                inputMode="email"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-accent text-white py-3 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent touch-target"
              >
                Submit Request
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}