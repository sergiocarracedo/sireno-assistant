import { Sun, Moon, Monitor } from "lucide-react";
import { Tooltip } from "@heroui/react";
import { useTheme, type Theme } from "../hooks/useTheme";

const ORDER: Theme[] = ["system", "light", "dark"];

const ICON = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const LABEL = {
  system: "System default",
  light: "Light mode",
  dark: "Dark mode",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  };

  const Icon = ICON[theme];

  return (
    <Tooltip content={LABEL[theme]} placement="bottom">
      <button
        onClick={cycle}
        aria-label={LABEL[theme]}
        className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
