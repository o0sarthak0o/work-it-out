
import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";

interface CheckboxGroupProps {
  value: string[];
  onChange: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

export const CheckboxGroup = ({
  value,
  onChange,
  children,
  className,
}: CheckboxGroupProps) => {
  const handleChange = (itemValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, itemValue]);
    } else {
      onChange(value.filter((v) => v !== itemValue));
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onChange: handleChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const Checkbox = ShadcnCheckbox;
