import { useState, useEffect } from 'react';
import { getStorageUsage, getStorageWarningLevel } from '@/lib/storage/storageMonitor';
import type { StorageWarningLevel } from '@/types';

interface StorageWarning {
  level: StorageWarningLevel;
  percentage: number;
}

export function useStorageWarning(): StorageWarning {
  const [level, setLevel] = useState<StorageWarningLevel>('ok');
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const check = async () => {
      const [usage, newLevel] = await Promise.all([
        getStorageUsage(),
        getStorageWarningLevel(),
      ]);
      setLevel(newLevel);
      setPercentage(Math.round(usage.percentage));
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { level, percentage };
}
