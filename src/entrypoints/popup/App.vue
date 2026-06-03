<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PluginSettings } from '~/types';

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
  status.value = '已保存';
  setTimeout(() => (status.value = ''), 2000);
}

async function extractPage() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await saveSettings();
  browser.tabs.sendMessage(tab.id, {
    type: 'EXTRACT_PAGE',
    targetLang: settings.value.defaultTargetLang,
    mode: currentMode.value,
  });
}

async function applyTranslation() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      await saveSettings();
      browser.tabs.sendMessage(tab.id!, {
        type: 'APPLY_TRANSLATION',
        data,
        mode: currentMode.value,
      });
      status.value = '翻译已应用';
      setTimeout(() => (status.value = ''), 2000);
    } catch {
      status.value = '文件格式错误';
      setTimeout(() => (status.value = ''), 3000);
    }
  };
  input.click();
}

async function removeTranslation() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  browser.tabs.sendMessage(tab.id, { type: 'REMOVE_TRANSLATION' });
}

function openOptions() {
  browser.tabs.create({ url: 'https://github.com/N0tsLabs/webi18n' });
}
</script>

<template>
  <div class="popup">
    <header class="header">
      <h1>🌐 Webi18n</h1>
      <span class="subtitle">网页翻译</span>
    </header>

    <div v-if="currentHostname" class="section">
      <label>当前网站</label>
      <div class="site-row">
        <span class="hostname">{{ currentHostname }}</span>
        <label class="toggle">
          <input type="checkbox" v-model="currentSiteEnabled" @change="saveSettings" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="section">
      <label>目标语言</label>
      <select v-model="settings.defaultTargetLang" @change="saveSettings" class="select">
        <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>

    <div class="section">
      <label>翻译模式</label>
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

    <div class="actions">
      <button class="btn primary" @click="extractPage">📥 提取页面文本</button>
      <button class="btn" @click="applyTranslation">📂 应用翻译文件</button>
      <button class="btn danger" @click="removeTranslation">🗑️ 移除翻译</button>
    </div>

    <div v-if="status" class="status">{{ status }}</div>

    <footer class="footer">
      <a href="https://github.com/N0tsLabs/webi18n" target="_blank" @click.prevent="openOptions">
        GitHub 仓库
      </a>
      <span class="sep">·</span>
      <span>v0.1.0</span>
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
  background: #0f0f23;
  color: #e0e0e0;
  width: 320px;
}

.popup {
  padding: 16px;
}

.header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1e1e3f;
}

.header h1 {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.subtitle {
  font-size: 12px;
  color: #666;
}

.section {
  margin-bottom: 14px;
}

.section label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
}

.site-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hostname {
  font-size: 14px;
  color: #aaa;
  font-family: monospace;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #333;
  border-radius: 22px;
  transition: 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .slider {
  background: #0969da;
}

.toggle input:checked + .slider::before {
  transform: translateX(18px);
}

.select {
  width: 100%;
  padding: 8px 10px;
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.select:focus {
  border-color: #0969da;
}

.mode-row {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  background: #1a1a2e;
  color: #aaa;
  border: 1px solid #333;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #0969da;
  color: #fff;
  border-color: #0969da;
}

.mode-btn:hover:not(.active) {
  border-color: #555;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  padding: 10px;
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: #0969da;
  background: #1e1e3f;
}

.btn.primary {
  background: #0969da;
  color: #fff;
  border-color: #0969da;
}

.btn.primary:hover {
  background: #0757b5;
}

.btn.danger {
  color: #f85149;
}

.btn.danger:hover {
  background: #2d1013;
  border-color: #f85149;
}

.status {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #3fb950;
}

.footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #1e1e3f;
  text-align: center;
  font-size: 12px;
  color: #555;
}

.footer a {
  color: #0969da;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.sep {
  margin: 0 4px;
}
</style>
