"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { searchPlaces, type PlaceResult } from "@lib/geocoding";

export type PlaceSelection = {
  address: string;
  lat: number;
  lng: number;
};

type PlaceAutocompleteInputProps = {
  id?: string;
  value: string;
  onChange: (value: string, coords: { lat: number | null; lng: number | null }) => void;
  onSelect?: (selection: PlaceSelection) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function PlaceAutocompleteInput({
  id,
  value,
  onChange,
  onSelect,
  disabled = false,
  placeholder,
  className,
}: PlaceAutocompleteInputProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const pickSuggestion = useCallback(
    (place: PlaceResult) => {
      onChange(place.label, { lat: place.lat, lng: place.lng });
      onSelect?.({ address: place.label, lat: place.lat, lng: place.lng });
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange, onSelect],
  );

  const displayedSuggestions =
    value.trim().length >= 2 ? suggestions : [];

  useEffect(() => {
    if (disabled || value.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const rows = await searchPlaces(value, { limit: 6 });
          if (controller.signal.aborted) {
            return;
          }
          setSuggestions(rows);
          setOpen(rows.length > 0);
          setActiveIndex(-1);
        } catch {
          if (!controller.signal.aborted) {
            setSuggestions([]);
            setOpen(false);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [disabled, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className={className}
        onChange={(event) => {
          onChange(event.target.value, { lat: null, lng: null });
        }}
        onFocus={() => {
          if (displayedSuggestions.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (!open || displayedSuggestions.length === 0) {
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => (i + 1) % displayedSuggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) =>
              i <= 0 ? displayedSuggestions.length - 1 : i - 1,
            );
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            const place = displayedSuggestions[activeIndex];
            if (place) {
              pickSuggestion(place);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && displayedSuggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-input bg-white py-1 shadow-card"
        >
          {displayedSuggestions.map((place, index) => (
            <li key={`${place.lat}-${place.lng}-${place.label}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={[
                  "w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted-surface",
                  index === activeIndex ? "bg-muted-surface" : "",
                ].join(" ")}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pickSuggestion(place);
                }}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loading ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-caption">
          …
        </span>
      ) : null}
    </div>
  );
}
