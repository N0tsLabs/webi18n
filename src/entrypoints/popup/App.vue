<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PluginSettings } from '~/types';
import { listAvailableTranslations } from '~/utils/fetcher';

const settings = ref<PluginSettings>({
  globalEnabled: true,
  defaultTargetLang: 'zh-CN',
  defaultMode: 'replace',
  sites: {},
});

const currentHostname = ref('');
const currentSiteEnabled = ref(true);
const currentMode = ref<'replace' | 'bilingual'>('replace');
const status = ref('');
const translationStatus = ref<'loading' | 'found' | 'not-found'>('loading');

const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
  { code: 'it', name: 'Italiano' },
];

onMounted(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      currentHostname.value = url.hostname;
    } catch {}
  }

  const result = await browser.storage.local.get('settings');
  if (result.settings) {
    settings.value = result.settings;
    if (currentHostname.value && settings.value.sites[currentHostname.value]) {
      const site = settings.value.sites[currentHostname.value];
      currentSiteEnabled.value = site.enabled;
      currentMode.value = site.mode;
    } else {
      currentSiteEnabled.value = settings.value.globalEnabled;
      currentMode.value = settings.value.defaultMode;
    }
  }

  if (currentHostname.value) {
    const available = await listAvailableTranslations();
    translationStatus.value = available.includes(currentHostname.value) ? 'found' : 'not-found';
  }
});

async function saveSettings() {
  if (currentHostname.value) {
    settings.value.sites[currentHostname.value] = {
      enabled: currentSiteEnabled.value,
      targetLang: settings.value.defaultTargetLang,
      mode: currentMode.value,
    };
  }
  settings.value.defaultMode = currentMode.value;
  await browser.storage.local.set({ settings: settings.value });
}

async function toggleSite() {
  await saveSettings();
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    browser.tabs.sendMessage(tab.id, { type: 'RELOAD_TRANSLATION' });
  }
}

function openGitHub() {
  browser.tabs.create({ url: 'https://github.com/N0tsLabs/webi18n' });
}
</script>

<template>
  <div class="popup">
    <header class="header">
      <div class="logo">🌐</div>
      <div class="header-text">
        <h1>Webi18n</h1>
        <span class="subtitle">网页翻译</span>
      </div>
    </header>

    <div v-if="currentHostname" class="card">
      <div class="card-header">
        <span class="site-icon">🔗</span>
        <span class="hostname">{{ currentHostname }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="currentSiteEnabled" @change="toggleSite" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="card-status">
        <span v-if="translationStatus === 'loading'" class="badge badge-loading">检查中...</span>
        <span v-else-if="translationStatus === 'found'" class="badge badge-ok">已翻译</span>
        <span v-else class="badge badge-none">暂无翻译</span>
      </div>
    </div>

    <div class="field">
      <label>目标语言</label>
      <select v-model="settings.defaultTargetLang" @change="saveSettings" class="select">
        <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>

    <div class="field">
      <label>显示模式</label>
      <div class="mode-row">
        <button
          :class="['mode-btn', { active: currentMode === 'replace' }]"
          @click="currentMode = 'replace'; saveSettings()"
        >
          替换原文
        </button>
        <button
          :class="['mode-btn', { active: currentMode === 'bilingual' }]"
          @click="currentMode = 'bilingual'; saveSettings()"
        >
          双语并排
        </button>
      </div>
    </div>

    <div v-if="status" class="toast">{{ status }}</div>

    <footer class="footer">
      <a href="https://github.com/N0tsLabs/webi18n" target="_blank" @click.prevent="openGitHub">
        GitHub
      </a>
      <span class="sep">·</span>
      <span class="version">v0.1.0</span>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #fff;
  color: #1a1a2e;
  width: 300px;
}

.popup {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.header-text h1 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.subtitle {
  font-size: 11px;
  color: #999;
}

.card {
  background: #f8f9ff;
  border: 1px solid #e8ecf4;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.site-icon {
  font-size: 14px;
}

.hostname {
  flex: 1;
  font-size: 13px;
  color: #555;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-status {
  margin-top: 8px;
}

.badge {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.badge-ok {
  background: #e6f7ed;
  color: #1a8a4a;
}

.badge-none {
  background: #f0f0f0;
  color: #888;
}

.badge-loading {
  background: #eef0ff;
  color: #667eea;
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  font-weight: 500;
}

.select {
  width: 100%;
  padding: 8px 10px;
  background: #f8f9ff;
  color: #1a1a2e;
  border: 1px solid #e8ecf4;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.select:focus {
  border-color: #667eea;
}

.mode-row {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  background: #f8f9ff;
  color: #888;
  border: 1px solid #e8ecf4;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.mode-btn:hover:not(.active) {
  border-color: #667eea;
  color: #667eea;
}

.toast {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #1a8a4a;
}

.footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  font-size: 11px;
  color: #bbb;
}

.footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.footer a:hover {
  text-decoration: underline;
}

.sep {
  margin: 0 4px;
}

.version {
  color: #ccc;
}
</style>
