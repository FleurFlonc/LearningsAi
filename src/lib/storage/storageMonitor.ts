import type { StorageUsage, StorageWarningLevel } from '@/types';

/**
 * Monitort de IndexedDB-opslagcapaciteit van de browser.
 * Geeft waarschuwingen bij hoog gebruik (>= 60%) of kritiek gebruik (>= 80%).
 */

export async function getStorageUsage(): Promise<StorageUsage> {
  if (!navigator.storage?.estimate) {
    return { used: 0, available: 0, percentage: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  const available = quota - used;
  const percentage = quota > 0 ? (used / quota) * 100 : 0;

  return { used, available, percentage };
}

export async function isStorageCritical(): Promise<boolean> {
  const usage = await getStorageUsage();
  return usage.percentage >= 80;
}

export async function isPrivateBrowsing(): Promise<boolean> {
  // Detecteert incognito/private browsing via een IndexedDB-toegangstest.
  // In sommige browsers is IndexedDB beperkt of geblokkeerd in private modus.
  try {
    const testDbName = '__ai_learning_log_private_test__';
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(testDbName);
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase(testDbName);
        resolve();
      };
      request.onerror = () => reject(new Error('IndexedDB niet beschikbaar'));
    });
    return false;
  } catch {
    return true;
  }
}

export async function getStorageWarningLevel(): Promise<StorageWarningLevel> {
  const usage = await getStorageUsage();
  if (usage.percentage >= 80) return 'critical';
  if (usage.percentage >= 60) return 'warning';
  return 'ok';
}
