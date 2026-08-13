import { useState } from 'react';
import { useNavigationStore } from '../app/navigationStore';
import { calculateRouteMetrics } from '../services/navigation/navigationService';
import { parseGpxFile } from '../services/gpx/gpxParser';
import { db } from '../storage/db';

export function useGpxImport() {
  const [isImporting, setIsImporting] = useState(false);
  const setActiveRoute = useNavigationStore((state) => state.setActiveRoute);

  const importFile = async (file: File) => {
    setIsImporting(true);
    try {
      const route = await parseGpxFile(file);
      const metrics = calculateRouteMetrics(route.points);

      await db.routes.put({
        id: route.id,
        name: route.name,
        route,
        metrics,
        createdAt: route.importedAt,
      });

      setActiveRoute(route, metrics);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFile,
    isImporting,
  };
}
