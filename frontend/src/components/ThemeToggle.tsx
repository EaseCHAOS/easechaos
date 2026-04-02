import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export default function ThemeToggle({ props = "right-0" }: { props?: string }) {
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Change theme"
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-md border",
          "border-gray-200 bg-white text-[#3F4652] hover:bg-gray-100",
          "dark:border-[#2A313C] dark:bg-[#11161D] dark:text-[#C6D0DE] dark:hover:bg-[#182131]",
          "transition-colors",
        )}
      >
        {theme === "dark" ? (
          <Moon className="h-4.5 w-4.5" />
        ) : theme === "light" ? (
          <Sun className="h-4.5 w-4.5" />
        ) : (
          <Monitor className="h-4.5 w-4.5" />
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={clsx(
            "absolute top-full mt-1 z-[9999] origin-top-right",
            props,
          )}
        >
          <div className="w-44 rounded-md border border-[#E4E4E7] bg-white shadow-lg dark:border-[#2A313C] dark:bg-[#11161D]">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setShowDropdown(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#3F4652] hover:bg-gray-100",
                  "dark:text-[#C6D0DE] dark:hover:bg-[#182131]",
                  theme === value &&
                    "bg-gray-100 text-[#111827] dark:bg-[#182131] dark:text-[#F0F6FC]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
