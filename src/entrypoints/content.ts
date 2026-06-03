import { applyTranslation, removeBilingual } from '~/utils/translator';
import { getSiteSettings } from '~/utils/settings';
import { fetchTranslation } from '~/utils/fetcher';
import type { TranslationFile } from '~/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const hostname = location.hostname;

    async function loadTranslation() {
      const settings = await getSiteSettings(hostname);
      if (!settings.enabled) return;

      const cached = sessionStorage.getItem(`webi18n-${hostname}`);
      if (cached) {
        try {
          const data: TranslationFile = JSON.parse(cached);
          applyTranslation(data, settings.mode);
          return;
        } catch {}
      }

      try {
        const data = await fetchTranslation(hostname);
        if (data && data.texts.some((t) => t.translated)) {
          sessionStorage.setItem(`webi18n-${hostname}`, JSON.stringify(data));
          applyTranslation(data, settings.mode);
        }
      } catch {}
    }

    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'RELOAD_TRANSLATION') {
        removeBilingual();
        sessionStorage.removeItem(`webi18n-${hostname}`);
        loadTranslation();
        sendResponse({ success: true });
      }
    });

    loadTranslation();
  },
});
