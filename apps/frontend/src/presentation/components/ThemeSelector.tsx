import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/components/ThemeSelector.css";

type ThemeType = "default" | "neon";

const THEMES = [
  { id: "default" as ThemeType, label: "DARK",  icon: "◐", color: "#00e5ff", description: "Balanced dark mode" },
  // { id: "light"   as ThemeType, label: "LIGHT", icon: "◯", color: "#663399", description: "Professional light mode" },
  { id: "neon"    as ThemeType, label: "NEON",  icon: "◆", color: "#ff006e", description: "High-contrast neon" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = THEMES.find((t) => t.id === theme)!;

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
        <span className="theme-selector__trigger-indicator" style={{ backgroundColor: current.color }} />
      </button>

      {isOpen && createPortal(
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
                  onClick={() => { setTheme(option.id); setIsOpen(false); }}
                  style={{ "--option-color": option.color } as React.CSSProperties}
                >
                  <span className="theme-selector__option-icon">{option.icon}</span>
                  <span className="theme-selector__option-text">
                    <span className="theme-selector__option-title">{option.label}</span>
                    <span className="theme-selector__option-description">{option.description}</span>
                  </span>
                  {theme === option.id && <span className="theme-selector__option-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="theme-selector__footer">
              <span className="theme-selector__footer-text">THEME CUSTOMIZATION</span>
              <span
                className="theme-selector__footer-dot"
                style={{ backgroundColor: current.color, boxShadow: `0 0 6px ${current.color}` }}
              />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}