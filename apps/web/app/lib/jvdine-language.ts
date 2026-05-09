export type Language = "JP" | "VN";

const STORAGE_KEY = "jvdine-language";

export function persistLanguage(language: Language) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, language);
  window.dispatchEvent(new Event("jvdine-language-change"));
}

export function subscribeLanguage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("jvdine-language-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("jvdine-language-change", onStoreChange);
  };
}

export function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") {
    return "JP";
  }
  return window.localStorage.getItem(STORAGE_KEY) === "VN" ? "VN" : "JP";
}

export function getServerLanguageSnapshot(): Language {
  return "JP";
}
