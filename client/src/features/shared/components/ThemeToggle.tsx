import { Moon, Sun } from "lucide-react";

import { Theme, useTheme } from "./ThemeProvider";
import { Button } from "./ui/Button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={"ghost"}
      className="justify-start p-2"
      onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
    >
      {theme === Theme.DARK ? (
        <>
          <Sun className="h-6 w-6" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-6 w-6" />
          Dark Mode
        </>
      )}
    </Button>
  );
};

export { ThemeToggle };
