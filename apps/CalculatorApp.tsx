import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { Delete } from 'lucide-react';

const CalculatorApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();

  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculateResult(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculateResult = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : 0;
      case '%':
        return prev % current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const result = calculateResult(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const getButtonClass = (btn: string) => {
    if (btn === 'C' || btn === '⌫') {
      return 'bg-red-500/20 hover:bg-red-500/30 text-red-400';
    }
    if (['+', '-', '×', '÷', '%', '='].includes(btn)) {
      return 'bg-primary/20 hover:bg-primary/30 text-primary font-bold';
    }
    return 'bg-white/5 hover:bg-white/10';
  };

  return (
    <div className="h-full flex items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-sm">
        {/* Display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-6 rounded-2xl backdrop-blur-md border"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: theme.colors.border,
          }}
        >
          <div className="text-right">
            <div className="text-sm text-text-secondary mb-1 h-5">
              {operation && previousValue !== null ? `${previousValue} ${operation}` : ''}
            </div>
            <div className="text-4xl font-bold break-all">{display}</div>
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-2">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
              {row.map((btn) => (
                <motion.button
                  key={btn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (btn === 'C') handleClear();
                    else if (btn === '⌫') handleBackspace();
                    else if (btn === '=') handleEquals();
                    else if (['+', '-', '×', '÷', '%'].includes(btn)) handleOperation(btn);
                    else if (btn === '.') handleDecimal();
                    else handleNumber(btn);
                  }}
                  className={`p-4 rounded-xl text-lg font-semibold transition-colors ${getButtonClass(btn)} ${
                    btn === '0' ? 'col-span-2' : ''
                  }`}
                >
                  {btn === '⌫' ? <Delete size={20} className="mx-auto" /> : btn}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorApp;
