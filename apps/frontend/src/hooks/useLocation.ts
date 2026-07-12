import { useSyncExternalStore } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  region: string | null; // full state/region name, e.g. "Colorado"
  country: string | null; // e.g. "France" — shown for non-US matches
  timezone: string | null; // IANA id, e.g. "America/Denver"
  manual: boolean; // true once the user has picked a ZIP/city explicitly
}

export interface CitySearchResult {
  id: string;
  name: string;
  admin1: string | null; // state/region
  country: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
}

const STORAGE_KEY = "dashboard-location";
const US_ZIP_RE = /^\d{5}$/;

// Module-level store shared by every useLocation() call (status bar, weather)
// so there's exactly one fetch and every consumer re-renders together.
let state: LocationData | null = null;
let started = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function setState(next: LocationData | null): void {
  state = next;
  emit();
}

function persist(loc: LocationData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

async function fetchByIp(): Promise<LocationData> {
  const res = await fetch("https://ipwho.is/");
  if (!res.ok) throw new Error("geolocation request failed");
  const j = await res.json();
  if (j.success === false) throw new Error("geolocation lookup failed");
  return {
    latitude: j.latitude,
    longitude: j.longitude,
    city: j.city ?? null,
    region: j.region ?? null,
    country: j.country ?? null,
    timezone: j.timezone?.id ?? null,
    manual: false,
  };
}

// Resolves the IANA timezone for a lat/lon via Open-Meteo (already used for
// weather elsewhere) — Zippopotam doesn't provide timezone data itself.
async function fetchTimezone(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&forecast_days=1`,
    );
    if (!res.ok) return null;
    const j = await res.json();
    return j.timezone ?? null;
  } catch {
    return null;
  }
}

// Zippopotam.us: free, keyless, CORS-open US ZIP -> city/state/lat/lon lookup.
// ZIPs are unambiguous (unlike city names), so this resolves directly without
// a disambiguation step.
async function fetchByZip(zip: string): Promise<LocationData> {
  const res = await fetch(
    `https://api.zippopotam.us/us/${encodeURIComponent(zip)}`,
  );
  if (!res.ok) throw new Error("ZIP code not found");
  const j = await res.json();
  const place = j.places?.[0];
  if (!place) throw new Error("ZIP code not found");
  const latitude = parseFloat(place.latitude);
  const longitude = parseFloat(place.longitude);
  return {
    latitude,
    longitude,
    city: place["place name"] ?? null,
    region: place.state ?? null,
    country: "United States",
    timezone: await fetchTimezone(latitude, longitude),
    manual: true,
  };
}

// Open-Meteo Geocoding: free, keyless, CORS-open worldwide city-name search
// (covers Europe and everywhere else a US ZIP can't reach). City names are
// often ambiguous ("Paris", "London"), so this returns candidates — sorted
// most-populous first — for the caller to show in a picker rather than
// guessing which one the user meant.
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`,
  );
  if (!res.ok) return [];
  const j = await res.json();
  const results: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
    timezone: string;
    population?: number;
  }> = j.results ?? [];
  return results
    .map((r) => ({
      id: `${r.latitude},${r.longitude}`,
      name: r.name,
      admin1: r.admin1 ?? null,
      country: r.country ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: r.population ?? 0,
    }))
    .sort((a, b) => b.population - a.population);
}

function locationFromCity(result: CitySearchResult): LocationData {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    city: result.name,
    region: result.admin1,
    country: result.country,
    timezone: result.timezone,
    manual: true,
  };
}

async function load(): Promise<void> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setState(JSON.parse(saved));
      return;
    }
    setState(await fetchByIp());
  } catch {
    // Keep the previous reading (or null) on transient failure.
  }
}

function ensureStarted(): void {
  if (!started) {
    started = true;
    load();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureStarted();
  return () => listeners.delete(listener);
}

function getSnapshot(): LocationData | null {
  return state;
}

// Commit a specific search result the user picked from the dropdown.
export function selectCity(result: CitySearchResult): void {
  const loc = locationFromCity(result);
  persist(loc);
  setState(loc);
}

// Commit a US ZIP directly (unambiguous, no picker needed). Throws if the
// ZIP is invalid — callers should catch this to show an error.
export async function setZipLocation(zip: string): Promise<void> {
  const loc = await fetchByZip(zip);
  persist(loc);
  setState(loc);
}

// Clear the manual override and go back to IP-based auto-detection.
export function clearLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
  load();
}

export function useLocation(): LocationData | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function isUsZip(query: string): boolean {
  return US_ZIP_RE.test(query.trim());
}
