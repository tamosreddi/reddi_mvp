import { Label } from "./label";
import Input from "./Input";
import { DollarSign } from "lucide-react";
import React from "react";

interface ValueInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  required?: boolean;
}

const ValueInput: React.FC<ValueInputProps> = ({ value, onChange, inputRef, required }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
    <div className="text-center mb-2">
      <Label htmlFor="value" className="text-lg font-medium text-gray-700">
        Valor <span className="text-red-500">*</span>
      </Label>
    </div>
    <div className="flex items-center justify-center">
      <div className="relative flex items-center w-full max-w-xs">
        <DollarSign className="absolute left-3 h-6 w-6 text-gray-400 pointer-events-none" />
        <Input
          id="value"
          ref={inputRef}
          type="number"
          value={value}
          onChange={onChange}
          className="pl-12 pr-4 py-6 text-3xl font-bold text-center text-gray-800 border-none rounded-lg focus:ring-blue-200"
          placeholder="0"
          required={required}
          aria-label="Valor de la venta"
        />
      </div>
    </div>
  </div>
);

export default ValueInput;