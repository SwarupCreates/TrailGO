import { useId, useState } from 'react';
import { useGpxImport } from '../hooks/useGpxImport';

type InitialActionsOverlayProps = {
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
};

export function InitialActionsOverlay({ isTracking, onStartTracking, onStopTracking }: InitialActionsOverlayProps) {
  const inputId = useId();
  const [error, setError] = useState<string>();
  const { importFile, isImporting } = useGpxImport();

  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center gap-4 px-6 pointer-events-none">
      {error && (
        <div className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
          {error}
        </div>
      )}

      <div className="flex gap-4 pointer-events-auto">


        {/* Upload Route Button */}
        <div className="relative">
          <label
            htmlFor={inputId}
            className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-full border border-white/10 bg-orange-600 px-6 font-bold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-500 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
            {isImporting ? 'Loading...' : 'Upload Route'}
          </label>
          <input
            id={inputId}
            type="file"
            accept=".gpx,application/gpx+xml,application/xml,text/xml"
            className="sr-only"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              setError(undefined);
              if (!file) return;

              try {
                await importFile(file);
              } catch (importError) {
                setError(importError instanceof Error ? importError.message : 'Unable to import GPX.');
              } finally {
                event.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
