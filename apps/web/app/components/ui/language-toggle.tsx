import type { Language } from "../../lib/jvdine-language";

export function LanguageToggle({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  function flip() {
    onLanguageChange(language === "JP" ? "VN" : "JP");
  }

  return (
    <button
      type="button"
      aria-label={
        language === "JP"
          ? "Japanese. Switch to Vietnamese."
          : "Vietnamese. Switch to Japanese."
      }
      onClick={flip}
      className="relative isolate h-8 w-[88px] shrink-0 rounded-full border border-primary bg-primary p-[2px] shadow-inner outline-none transition-[box-shadow] duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-white shadow-sm transition-[left,right] duration-200 ease-out ${
          language === "JP"
            ? "left-[2px] right-[calc(50%-2px)]"
            : "left-[calc(50%-2px)] right-[2px]"
        }`}
      />
      <span className="relative z-[1] flex h-full w-full items-stretch pt-px text-xs font-bold">
        <span
          aria-hidden
          className={`flex flex-1 select-none items-center justify-center whitespace-nowrap ${
            language === "JP" ? "text-primary" : "text-white"
          }`}
        >
          JP
        </span>
        <span
          aria-hidden
          className={`flex flex-1 select-none items-center justify-center whitespace-nowrap ${
            language === "VN" ? "text-primary" : "text-white"
          }`}
        >
          VN
        </span>
      </span>
    </button>
  );
}
