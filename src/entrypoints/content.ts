import { applyTranslation, removeBilingual } from '~/utils/translator';
import { getSiteSettings } from '~/utils/settings';
import { fetchTranslation } from '~/utils/fetcher';
import type { TranslationFile } from '~/types';

const MAX_LOGS = 50;
const logs: string[] = [];

function log(msg: string) {
  const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  console.log(`[Webi18n] ${msg}`);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const hostname = location.hostname;
    log(`页面加载: ${hostname}`);

    async function loadTranslation() {
      const settings = await getSiteSettings(hostname);
      if (!settings.enabled) {
        log(`${hostname} 已禁用，跳过`);
        return;
      }

      const cached = sessionStorage.getItem(`webi18n-${hostname}`);
      if (cached) {
        try {
          const data: TranslationFile = JSON.parse(cached);
          log(`从缓存加载 ${data.texts.length} 条翻译`);
          const result = applyTranslation(data, settings.mode);
          log(`应用完成: ${result.applied} 条成功, ${result.missed} 条未匹配`);
          return;
        } catch (e) {
          log(`缓存解析失败: ${e}`);
        }
      }

      try {
        log(`从 GitHub 拉取翻译: ${hostname}`);
        const data = await fetchTranslation(hostname);
        if (!data) {
          log(`${hostname} 暂无翻译文件`);
          return;
        }
        log(`获取到 ${data.texts.length} 条翻译`);
        const translatable = data.texts.filter((t) => t.translated);
        if (translatable.length === 0) {
          log(`无有效翻译内容`);
          return;
        }
        sessionStorage.setItem(`webi18n-${hostname}`, JSON.stringify(data));
        const result = applyTranslation(data, settings.mode);
        log(`应用完成: ${result.applied} 条成功, ${result.missed} 条未匹配`);
      } catch (e) {
        log(`翻译加载失败: ${e}`);
      }
    }

    browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'RELOAD_TRANSLATION') {
        removeBilingual();
        sessionStorage.removeItem(`webi18n-${hostname}`);
        loadTranslation();
        sendResponse({ success: true });
      }
      if (msg.type === 'GET_LOGS') {
        sendResponse({ logs: [...logs] });
      }
    });

    loadTranslation();
  },
});
