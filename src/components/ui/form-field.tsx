import * as React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  id?: string;
}

export function FormField({ label, children, required, id }: FormFieldProps) {
  return (
    <div className="space-y-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      <label htmlFor={id}>
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {React.cloneElement(children as React.ReactElement, { id })}
    </div>
  );
}
