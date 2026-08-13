import { useId, useState } from 'react';
import { useGpxImport } from '../hooks/useGpxImport';

export function GpxImportButton() {
  const inputId = useId();
  const [error, setError] = useState<string>();
  const { importFile, isImporting } = useGpxImport();

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center justify-center rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {isImporting ? 'Importing...' : 'Import GPX'}
      </label>
      <input
        id={inputId}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        className="sr-only"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          setError(undefined);
          if (!file) {
            return;
          }

          try {
            await importFile(file);
          } catch (importError) {
            setError(importError instanceof Error ? importError.message : 'Unable to import GPX file.');
          } finally {
            event.currentTarget.value = '';
          }
        }}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
