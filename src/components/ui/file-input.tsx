
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileInputProps {
  onChange: (files: FileList | null) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  onChange,
  multiple = false,
  accept,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
  };

  return (
    <Input
      type="file"
      onChange={handleChange}
      multiple={multiple}
      accept={accept}
      className={className}
    />
  );
};
