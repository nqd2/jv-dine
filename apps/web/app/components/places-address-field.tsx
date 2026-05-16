"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

import { FormField, InputWithLeading, textFieldClasses } from "./ui/form";

export type PlaceSelection = {
  address: string;
  lat: number | null;
  long: number | null;
};

type PlacesAddressFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (selection: PlaceSelection) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function PlacesAddressField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
}: PlacesAddressFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || disabled || !inputRef.current) {
      return;
    }

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    const init = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        return;
      }
      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "vn" },
        fields: ["formatted_address", "geometry"],
      });
      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete?.getPlace();
        const loc = place?.geometry?.location;
        onChange({
          address: place?.formatted_address ?? inputRef.current?.value ?? "",
          lat: loc ? loc.lat() : null,
          long: loc ? loc.lng() : null,
        });
      });
    };

    if (window.google?.maps?.places) {
      init();
    } else {
      const existing = document.querySelector(
        'script[data-jvdine-places="1"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.dataset.jvdinePlaces = "1";
        script.onload = init;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", init);
      }
    }

    return () => {
      listener?.remove();
    };
  }, [disabled, onChange]);

  return (
    <FormField label={label} htmlFor={id}>
      <InputWithLeading leading={<MapPin className="size-5" aria-hidden />}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className={`${textFieldClasses} pl-11`}
          onChange={(ev) =>
            onChange({ address: ev.target.value, lat: null, long: null })
          }
        />
      </InputWithLeading>
    </FormField>
  );
}
