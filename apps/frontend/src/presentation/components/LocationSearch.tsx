import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useLocation,
  searchCities,
  selectCity,
  setZipLocation,
  clearLocation,
  isUsZip,
  type CitySearchResult,
} from "../../hooks/useLocation";
import "../styles/components/LocationSearch.css";

const SEARCH_DEBOUNCE_MS = 300;

export function LocationSearch(): JSX.Element {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [error, setError] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Non-US matches show their country too (region names alone are ambiguous
  // outside the US, e.g. "Île-de-France" isn't obviously Paris).
  const locationText = location
    ? [
        location.city,
        location.region,
        location.country !== "United States" ? location.country : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "Locating…";

  const openEditor = () => {
    setInput("");
    setResults([]);
    setError(false);
    setIsOpen(true);
  };

  const closeEditor = () => {
    setIsOpen(false);
    setResults([]);
  };

  const commitZip = async (zip: string) => {
    try {
      await setZipLocation(zip);
      closeEditor();
    } catch {
      setError(true);
    }
  };

  const commitCity = (result: CitySearchResult) => {
    selectCity(result);
    closeEditor();
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      clearLocation();
      closeEditor();
      return;
    }
    if (isUsZip(trimmed)) {
      commitZip(trimmed);
      return;
    }
    if (results.length > 0) commitCity(results[0]);
  };

  // Debounced city search as the user types (skips ZIP-looking input).
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const trimmed = input.trim();
    if (!trimmed || isUsZip(trimmed)) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const found = await searchCities(trimmed);
      setResults(found);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [isOpen, results]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => closeEditor();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const showDropdown = isOpen && results.length > 0;

  return (
    <div className="status-bar__location" ref={wrapRef}>
      <svg
        className="status-bar__location-pin"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>

      {isOpen ? (
        <input
          ref={inputRef}
          className={`status-bar__location-input ${error ? "status-bar__location-input--error" : ""}`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") closeEditor();
          }}
          onBlur={() => closeEditor()}
          placeholder="City or US ZIP"
        />
      ) : (
        <span
          className="status-bar__location-text"
          onClick={openEditor}
          title="Click to search a city or US ZIP for exact accuracy"
        >
          {locationText}
        </span>
      )}

      {showDropdown &&
        createPortal(
          <div
            className="location-search__menu"
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              minWidth: menuPos.width,
              maxWidth: `calc(100vw - 16px)`,
              zIndex: 9999,
            }}
          >
            {results.slice(0, 6).map((r) => (
              <button
                key={r.id}
                className="location-search__option"
                // onMouseDown (not onClick) fires before the input's onBlur,
                // so the selection registers before the dropdown closes.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitCity(r);
                }}
              >
                <span className="location-search__option-name">{r.name}</span>
                <span className="location-search__option-detail">
                  {[r.admin1, r.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
