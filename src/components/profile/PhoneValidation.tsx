
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneValidationProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneValidation: React.FC<PhoneValidationProps> = ({
  value,
  onChange,
  error,
  disabled = false
}) => {
  const validateNamibianPhone = (phone: string): string | undefined => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it matches Namibian format
    if (!phone.match(/^\+264\s\d{2}\s\d{3}\s\d{4}$/)) {
      return 'Phone must be in format +264 XX XXX XXXX';
    }
    
    return undefined;
  };

  const formatPhone = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // If starts with 264, add +
    let formatted = digits;
    if (digits.startsWith('264')) {
      formatted = '+' + digits;
    } else if (!digits.startsWith('+264')) {
      formatted = '+264' + digits;
    }
    
    // Format as +264 XX XXX XXXX
    const match = formatted.match(/^\+264(\d{0,2})(\d{0,3})(\d{0,4})/);
    if (match) {
      let result = '+264';
      if (match[1]) result += ` ${match[1]}`;
      if (match[2]) result += ` ${match[2]}`;
      if (match[3]) result += ` ${match[3]}`;
      return result;
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  const validationError = validateNamibianPhone(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <Input
        id="phone"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="+264 81 234 5678"
        className={validationError || error ? 'border-red-500' : ''}
        maxLength={17} // +264 XX XXX XXXX
      />
      {(validationError || error) && (
        <p className="text-sm text-red-500">{validationError || error}</p>
      )}
    </div>
  );
};
