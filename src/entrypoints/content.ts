import { scrapePage } from '~/utils/dom-scraper';
import { applyTranslation, removeBilingual } from '~/utils/translator';
import { getSiteSettings } from '~/utils/settings';
import type { TranslationFile } from '~/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    const hostname = location.hostname;

    function showToast(message: string, duration = 3000) {
      const existing = document.getElementById('webi18n-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'webi18n-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 999999;
        background: #1a1a2e; color: #fff; padding: 12px 20px;
        border-radius: 8px; font-size: 14px; font-family: system-ui;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: webi18n-fadeIn 0.3s ease;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), duration);
    }

    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'EXTRACT_PAGE') {
        const entries = scrapePage();
        const data: TranslationFile = {
          meta: {
            url: location.href,
            hostname,
            extractedAt: new Date().toISOString(),
            sourceLang: document.documentElement.lang || 'auto',
            targetLang: msg.targetLang || 'zh-CN',
            mode: msg.mode || 'replace',
          },
          texts: entries,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `webi18n-${hostname}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(`已提取 ${entries.length} 条文本，请在 AI 助手中运行翻译`);
        sendResponse({ success: true, count: entries.length });
      }

      if (msg.type === 'APPLY_TRANSLATION') {
        const data: TranslationFile = msg.data;
        const mode = msg.mode || 'replace';

        removeBilingual();
        applyTranslation(data, mode);
        showToast(`已应用 ${data.texts.filter((t) => t.translated).length} 条翻译`);
        sendResponse({ success: true });
      }

      if (msg.type === 'REMOVE_TRANSLATION') {
        removeBilingual();
        location.reload();
        sendResponse({ success: true });
      }
    });

    async function autoApply() {
      const settings = await getSiteSettings(hostname);
      if (!settings.enabled) return;

      try {
        const cached = sessionStorage.getItem(`webi18n-${hostname}`);
        if (cached) {
          const data: TranslationFile = JSON.parse(cached);
          applyTranslation(data, settings.mode);
        }
      } catch {}
    }

    autoApply();
  },
});
