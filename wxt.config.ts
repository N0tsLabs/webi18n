import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
  manifest: {
    name: 'Webi18n · 网页翻译',
    description: 'AI驱动的多语言网站翻译浏览器插件',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    action: {
      default_popup: 'popup.html',
      default_title: 'Webi18n · 网页翻译',
    },
    icons: {
      16: 'icon-16.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  },
});
