'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PyTorchImporter } from '@/lib/importers/pytorch';
import { NeuroscopeNetwork } from '@/lib/types/network';

interface ModelImporterProps {
  onImport: (network: NeuroscopeNetwork) => void;
}

export function ModelImporter({ onImport }: ModelImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weightsFile, setWeightsFile] = useState<File | null>(null);
  const [infoFile, setInfoFile] = useState<File | null>(null);
  const importer = new PyTorchImporter();

  const handleWeightsSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWeightsFile(file);
      setError(null);
    }
  }, []);

  const handleInfoSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInfoFile(file);
      setError(null);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!weightsFile || !infoFile) {
      setError('Please select both weights and info files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if Python service is healthy
      const isHealthy = await importer.checkHealth();
      if (!isHealthy) {
        throw new Error('Python service is not available');
      }

      // Import the model
      const network = await importer.importModel(weightsFile, infoFile);
      onImport(network);
      
      // Clear files after successful import
      setWeightsFile(null);
      setInfoFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import model');
    } finally {
      setIsLoading(false);
    }
  }, [weightsFile, infoFile, onImport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".pt,.pth"
              onChange={handleWeightsSelect}
              className="hidden"
              id="weights-file"
              disabled={isLoading}
            />
            <Button
              asChild
              variant="outline"
              className="w-full mb-2"
              disabled={isLoading}
            >
              <label htmlFor="weights-file" className="cursor-pointer">
                {weightsFile ? weightsFile.name : 'Select Weights File'}
              </label>
            </Button>

            <input
              type="file"
              accept=".pt,.pth"
              onChange={handleInfoSelect}
              className="hidden"
              id="info-file"
              disabled={isLoading}
            />
            <Button
              asChild
              variant="outline"
              className="w-full mb-4"
              disabled={isLoading}
            >
              <label htmlFor="info-file" className="cursor-pointer">
                {infoFile ? infoFile.name : 'Select Info File'}
              </label>
            </Button>

            <Button
              onClick={handleImport}
              className="w-full"
              disabled={isLoading || !weightsFile || !infoFile}
            >
              {isLoading ? 'Importing...' : 'Import Model'}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Required files:
            <ul className="list-disc list-inside mt-1">
              <li>Weights file (.pt/.pth)</li>
              <li>Model info file (.pt/.pth)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 