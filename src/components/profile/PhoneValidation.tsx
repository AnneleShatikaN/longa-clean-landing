
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneValidationProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const PhoneValidation: React.FC<PhoneValidationProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Phone Number",
  placeholder = "+264 81 234 5678"
}) => {
  const validateNamibianPhone = (phone: string): string | undefined => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it matches Namibian format after cleaning
    if (cleanPhone.length === 0) {
      return 'Phone number is required';
    }
    
    // Should be 264 + 9 digits (total 12) or just 9 digits
    if (cleanPhone.startsWith('264')) {
      if (cleanPhone.length !== 12) {
        return 'Namibian phone numbers should be 9 digits after +264';
      }
    } else {
      if (cleanPhone.length !== 9) {
        return 'Please enter a valid 9-digit Namibian phone number';
      }
    }
    
    return undefined;
  };

  const formatPhone = (input: string): string => {
    // Remove all non-digit characters except +
    let digits = input.replace(/[^\d+]/g, '');
    
    // Handle if user types just digits (assume Namibian number)
    if (!digits.startsWith('+') && !digits.startsWith('264')) {
      digits = '264' + digits;
    }
    
    // Remove + for processing
    if (digits.startsWith('+')) {
      digits = digits.substring(1);
    }
    
    // Ensure it starts with 264
    if (!digits.startsWith('264')) {
      digits = '264' + digits.replace(/^264/, ''); // Avoid double 264
    }
    
    // Limit to country code + 9 digits
    if (digits.length > 12) {
      digits = digits.substring(0, 12);
    }
    
    // Format as +264 XX XXX XXXX
    let formatted = '+264';
    if (digits.length > 3) {
      const remaining = digits.substring(3);
      if (remaining.length >= 1) {
        formatted += ` ${remaining.substring(0, 2)}`;
      }
      if (remaining.length >= 3) {
        formatted += ` ${remaining.substring(2, 5)}`;
      }
      if (remaining.length >= 6) {
        formatted += ` ${remaining.substring(5, 9)}`;
      }
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  const validationError = validateNamibianPhone(value);
  const displayError = validationError || error;

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">{label}</Label>
      <Input
        id="phone"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={displayError ? 'border-red-500' : ''}
        maxLength={17} // +264 XX XXX XXXX
      />
      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
      <p className="text-xs text-gray-500">
        Format: +264 XX XXX XXXX (Namibian numbers only)
      </p>
    </div>
  );
};
