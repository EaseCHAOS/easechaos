import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={clsx(
          "p-2 rounded-lg",
          "hover:bg-gray-100 dark:hover:bg-[#303030]",
          "transition-colors",
          "border border-gray-200 dark:border-[#303030]",
          "relative flex items-center"
        )}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 dark:text-[#B2B2B2]" />
        ) : theme === 'light' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5 dark:text-[#B2B2B2]" />
        )}
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full -right-30 mt-1 z-[9999]"
        >
          <div className="w-48 rounded-md shadow-lg bg-white dark:bg-[#262626] ring-1 ring-black ring-opacity-5">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setShowDropdown(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 text-left flex items-center space-x-2",
                  "hover:bg-gray-100 dark:hover:bg-[#303030]",
                  theme === value && "bg-gray-100 dark:bg-[#303030]"
                )}
              >
                <Icon className="w-4 h-4 dark:text-[#B2B2B2]" />
                <span className="text-sm dark:text-[#B2B2B2]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 