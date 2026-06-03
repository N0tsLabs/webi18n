export interface TextEntry {
  id: string;
  original: string;
  selector: string | null;
  attribute: string | null;
  translated: string | null;
}

export interface TranslationFile {
  meta: {
    url: string;
    hostname: string;
    extractedAt: string;
    sourceLang: string;
    targetLang: string;
    mode: 'replace' | 'bilingual';
  };
  texts: TextEntry[];
}

export interface SiteSettings {
  enabled: boolean;
  targetLang: string;
  mode: 'replace' | 'bilingual';
}

export interface PluginSettings {
  globalEnabled: boolean;
  defaultTargetLang: string;
  defaultMode: 'replace' | 'bilingual';
  sites: Record<string, SiteSettings>;
}
