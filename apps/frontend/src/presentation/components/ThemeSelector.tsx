import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme, type Theme } from "../context/ThemeContext";
import "../styles/components/ThemeSelector.css";

const THEMES = [
  {
    id: "default" as Theme,
    label: "DARK",
    icon: "◐",
    color: "#00e5ff",
    description: "Balanced dark mode",
  },
  {
    id: "light" as Theme,
    label: "LIGHT",
    icon: "◯",
    color: "#663399",
    description: "Professional light",
  },
  {
    id: "pink" as Theme,
    label: "PINK",
    icon: "◆",
    color: "#ff006e",
    description: "Vibrant pink glow",
  },
  {
    id: "red" as Theme,
    label: "RED",
    icon: "◆",
    color: "#ff3d3d",
    description: "Bold red energy",
  },
  {
    id: "yellow" as Theme,
    label: "YELLOW",
    icon: "◆",
    color: "#ffff00",
    description: "Neon yellow shine",
  },
  {
    id: "obsidian" as Theme,
    label: "OBSIDIAN",
    icon: "◈",
    color: "#c084fc",
    description: "Purple, black & cream",
  },
  {
    id: "midnight" as Theme,
    label: "MIDNIGHT",
    icon: "◈",
    color: "#4d9fff",
    description: "Deep navy & violet",
  },
  {
    id: "forest" as Theme,
    label: "FOREST",
    icon: "◈",
    color: "#4ade80",
    description: "Dark green & warm wood",
  },
  {
    id: "aurora" as Theme,
    label: "AURORA",
    icon: "◈",
    color: "#00e5cc",
    description: "Teal & violet drift",
  },
  {
    id: "ocean" as Theme,
    label: "OCEAN",
    icon: "◈",
    color: "#0096ff",
    description: "Deep blue & cyan",
  },
  {
    id: "matrix" as Theme,
    label: "MATRIX",
    icon: "◈",
    color: "#00ff9d",
    description: "Phosphor green",
  },
  {
    id: "neon" as Theme,
    label: "NEON",
    icon: "◈",
    color: "#bf5af2",
    description: "Purple & electric yellow",
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  return (
    <div className="theme-selector">
      <button
        ref={triggerRef}
        className="theme-selector__trigger"
        onClick={() => setIsOpen((o) => !o)}
        style={{ borderColor: current.color, color: current.color }}
      >
        <span className="theme-selector__trigger-icon">{current.icon}</span>
        <span className="theme-selector__trigger-label">{current.label}</span>
        <span
          className="theme-selector__trigger-indicator"
          style={{ backgroundColor: current.color }}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />
            <div
              className="theme-selector__menu"
              style={{
                position: "fixed",
                top: menuPos.top,
                right: menuPos.right,
                zIndex: 9999,
              }}
            >
              <div className="theme-selector__options">
                {THEMES.map((option) => (
                  <button
                    key={option.id}
                    className={`theme-selector__option${theme === option.id ? " theme-selector__option--active" : ""}`}
                    onClick={() => {
                      setTheme(option.id);
                      setIsOpen(false);
                    }}
                    style={
                      { "--option-color": option.color } as React.CSSProperties
                    }
                  >
                    <span className="theme-selector__option-icon">
                      {option.icon}
                    </span>
                    <span className="theme-selector__option-text">
                      <span className="theme-selector__option-title">
                        {option.label}
                      </span>
                      <span className="theme-selector__option-description">
                        {option.description}
                      </span>
                    </span>
                    {theme === option.id && (
                      <span className="theme-selector__option-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="theme-selector__footer">
                <span className="theme-selector__footer-text">
                  THEME CUSTOMIZATION
                </span>
                <span
                  className="theme-selector__footer-dot"
                  style={{
                    backgroundColor: current.color,
                    boxShadow: `0 0 6px ${current.color}`,
                  }}
                />
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
