import { useEffect, useState } from "react";

const themes = [
  { name: "light", icon: "light_mode", themeLabel: "Use light theme" },
  { name: "dark", icon: "nightlight", themeLabel: "Use dark theme" },
];

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(() => {
    if (import.meta.env.SSR) {
      return;
    }
    return document.documentElement.classList.contains("theme-dark")
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.replace("theme-dark", "theme-light");
    } else {
      root.classList.replace("theme-light", "theme-dark");
    }
  }, [theme]);

  return (
    <div className="inline-flex gap-1 py-2 px-3 rounded-xl text-xl bg-gray-300 text-center leading-3">
      {themes.map(({ name, icon, themeLabel }) => {
        const checked = name === theme;
        return (
          <label
            key={themeLabel}
            title={themeLabel}
            className={`cursor-pointer ${
              checked ? "checked" : ""
            } hover:brightness-125`}
          >
            <span
              className={`material-icons text-xl ${
                checked ? "text-teal-500" : "text-gray-500"
              }`}
            >
              {icon}
            </span>
            <input
              className="absolute opacity-0 -z-10"
              type="radio"
              name="theme-toggle"
              checked={checked}
              value={name}
              aria-label={themeLabel}
              onChange={() => {
                const matchesDarkTheme = window.matchMedia(
                  "(prefers-color-scheme: dark)"
                ).matches;

                if (
                  (matchesDarkTheme && name === "dark") ||
                  (!matchesDarkTheme && name === "light")
                ) {
                  localStorage.removeItem("theme");
                } else {
                  localStorage.setItem("theme", name);
                }
                setTheme(name);
              }}
            />
          </label>
        );
      })}
    </div>
  );
};

export default ThemeToggleButton;
