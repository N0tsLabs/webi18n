import type { PluginSettings, SiteSettings } from '~/types';

const DEFAULT_SETTINGS: PluginSettings = {
  globalEnabled: true,
  defaultTargetLang: 'zh-CN',
  defaultMode: 'replace',
  sites: {},
};

export async function getSettings(): Promise<PluginSettings> {
  const result = await browser.storage.local.get('settings');
  return result.settings ?? DEFAULT_SETTINGS;
}

export async function updateSettings(partial: Partial<PluginSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await browser.storage.local.set({ settings: updated });
}

export async function getSiteSettings(hostname: string): Promise<SiteSettings> {
  const settings = await getSettings();
  return (
    settings.sites[hostname] ?? {
      enabled: settings.globalEnabled,
      targetLang: settings.defaultTargetLang,
      mode: settings.defaultMode,
    }
  );
}

export async function setSiteSettings(
  hostname: string,
  site: Partial<SiteSettings>,
): Promise<void> {
  const settings = await getSettings();
  const current = settings.sites[hostname] ?? {
    enabled: settings.globalEnabled,
    targetLang: settings.defaultTargetLang,
    mode: settings.defaultMode,
  };
  settings.sites[hostname] = { ...current, ...site };
  await browser.storage.local.set({ settings });
}
