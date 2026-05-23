"use client";

import { MapPin } from "lucide-react";

import { FormField, InputWithLeading, textFieldClasses } from "./ui/form";
import { PlaceAutocompleteInput } from "./ui/place-autocomplete-input";

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
  return (
    <FormField label={label} htmlFor={id}>
      <InputWithLeading leading={<MapPin className="size-5" aria-hidden />}>
        <PlaceAutocompleteInput
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className={`${textFieldClasses} pl-11`}
          onChange={(address, coords) =>
            onChange({
              address,
              lat: coords.lat,
              long: coords.lng,
            })
          }
        />
      </InputWithLeading>
    </FormField>
  );
}
