import type { TranslationFile } from '~/types';

function getTempDir(): string {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) return `${process.env.TEMP || 'C:\\Temp'}\\webi18n`;
  if (platform.includes('mac')) return '/tmp/webi18n';
  return '/tmp/webi18n';
}

export function getExtractFilePath(hostname: string): string {
  const timestamp = Date.now();
  const dir = getTempDir();
  return `${dir}\\${hostname}-${timestamp}.json`;
}

export function getTranslatedFilePath(extractPath: string): string {
  return extractPath.replace('.json', '-translated.json');
}

export async function writeTranslationFile(data: TranslationFile): Promise<string> {
  const filePath = getExtractFilePath(data.meta.hostname);
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.meta.hostname}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return a.download;
}

export async function readTranslationFile(file: File): Promise<TranslationFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
