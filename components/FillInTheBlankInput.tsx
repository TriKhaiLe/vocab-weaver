import React, { useRef, createRef, useEffect } from 'react';

interface FillInTheBlankInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const FillInTheBlankInput: React.FC<FillInTheBlankInputProps> = ({ length, value, onChange, disabled }) => {
  const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);
  
  // Ensure refs array is the correct size
  if (inputRefs.current.length !== length) {
    inputRefs.current = Array(length).fill(null).map((_, i) => inputRefs.current[i] || createRef<HTMLInputElement>());
  }

  useEffect(() => {
    // Focus the first input when a new word is presented
    if (!disabled) {
      inputRefs.current[0]?.current?.focus();
    }
  }, [length, disabled]);

  const handleChange = (index: number, inputValue: string) => {
    if (!/^[a-zA-Z]*$/.test(inputValue)) return;

    const newChars = value.split('');
    newChars[index] = inputValue.slice(-1).toLowerCase();
    
    onChange(newChars.join('').slice(0, length));

    // Move focus to the next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        // If the current input is empty and we're not on the first box, move focus back
        if (!value[index] && index > 0) {
          inputRefs.current[index - 1]?.current?.focus();
        }
        break;
      case 'ArrowLeft':
        if (index > 0) {
          inputRefs.current[index - 1]?.current?.focus();
        }
        break;
      case 'ArrowRight':
        if (index < length - 1) {
          inputRefs.current[index + 1]?.current?.focus();
        }
        break;
      default:
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toLowerCase().replace(/[^a-z]/g, '');
    if (!pastedText) return;

    const currentTargetIndex = e.currentTarget.dataset.index ? parseInt(e.currentTarget.dataset.index, 10) : 0;
    const chars = value.split('');
    
    let j = 0;
    for (let i = currentTargetIndex; i < length && j < pastedText.length; i++, j++) {
      chars[i] = pastedText[j];
    }
    
    const newValue = chars.join('').slice(0, length);
    onChange(newValue);

    const nextFocusIndex = Math.min(currentTargetIndex + pastedText.length, length);
    if (nextFocusIndex < length) {
        inputRefs.current[nextFocusIndex]?.current?.focus();
    } else {
        inputRefs.current[length - 1]?.current?.focus();
    }
  };
  
  const chars = value.padEnd(length, ' ').split('');

  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={inputRefs.current[index]}
          type="text"
          maxLength={1}
          value={chars[index].trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          data-index={index}
          disabled={disabled}
          className="w-10 h-12 md:w-12 md:h-14 text-center bg-dark-bg border-2 border-dark-border rounded-md text-2xl font-bold uppercase focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition disabled:bg-gray-800 disabled:opacity-70"
          aria-label={`Character ${index + 1} of ${length}`}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      ))}
    </div>
  );
};
