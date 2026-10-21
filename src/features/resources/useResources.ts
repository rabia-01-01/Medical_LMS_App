import { useState, useEffect, useCallback } from 'react';
import type { ResourceWithFile, ResourceFilter, CreateResourceInput } from './types';
import * as resourceService from './resourceService';
import { useAuth } from '../../context/AuthContext';

export function useResources(initialFilter?: ResourceFilter) {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceWithFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<ResourceFilter>(initialFilter || {});

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourceService.fetchResources(filter);
      setResources(data);
    } catch (err: any) {
      console.error('[useResources] Failed to load resources:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const setFilter = useCallback((newFilter: Partial<ResourceFilter>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const uploadResource = useCallback(
    async (input: CreateResourceInput): Promise<ResourceWithFile> => {
      try {
        const creatorId = user?.id || 'anonymous';
        const creatorName = user?.name || 'Faculty';
        const created = await resourceService.createResource(input, creatorId, creatorName);
        setResources((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        console.error('[useResources] Upload failed:', err);
        throw err;
      }
    },
    [user]
  );

  const deleteResource = useCallback(
    async (resourceId: string, storagePath?: string) => {
      try {
        await resourceService.deleteResource(resourceId, storagePath);
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      } catch (err: any) {
        console.error('[useResources] Delete failed:', err);
        throw err;
      }
    },
    []
  );

  const getSignedUrl = useCallback(
    async (storagePath: string, expiresIn?: number) => {
      return resourceService.getSignedResourceUrl(storagePath, expiresIn);
    },
    []
  );

  return {
    resources,
    loading,
    error,
    filter,
    setFilter,
    refetch: loadResources,
    uploadResource,
    deleteResource,
    getSignedUrl,
  };
}
