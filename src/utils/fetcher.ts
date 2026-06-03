import type { TranslationFile } from '~/types';

const GRAW_BASE = 'https://raw.githubusercontent.com/N0tsLabs/webi18n/main/translations';
const REPO_API = 'https://api.github.com/repos/N0tsLabs/webi18n/contents/translations';

export async function fetchTranslation(hostname: string): Promise<TranslationFile | null> {
  const url = `${GRAW_BASE}/${hostname}.json`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) return null;
  return resp.json();
}

export async function listAvailableTranslations(): Promise<string[]> {
  try {
    const resp = await fetch(REPO_API);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data
      .filter((item: any) => item.name.endsWith('.json'))
      .map((item: any) => item.name.replace('.json', ''));
  } catch {
    return [];
  }
}
