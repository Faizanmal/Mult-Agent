import { } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'agent_extension' | 'workflow_node' | 'integration' | 'tool' | 'custom';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  author: {
    id: string;
    username: string;
  };
  repository_url?: string;
  documentation_url?: string;
  configuration_schema: Record<string, unknown>;
  permissions_required: string[];
  dependencies: string[];
  tags: string[];
  is_public: boolean;
  download_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

interface PluginInstallation {
  id: string;
  plugin: Plugin;
  configuration: Record<string, unknown>;
  is_active: boolean;
  installed_at: string;
  last_updated: string;
}

// Plugin API functions
const pluginApi = {
  // Get all plugins
  getAllPlugins: async (): Promise<Plugin[]> => {
    const response = await apiClient.getPlugins();
    return response.results;
  },

  // Get installed plugins
  getInstalledPlugins: async (): Promise<PluginInstallation[]> => {
    const response = await apiClient.getInstalledPlugins();
    return response.results;
  },

  // Get public plugins
  getPublicPlugins: async (): Promise<Plugin[]> => {
    const response = await apiClient.getPublicPlugins();
    return response.results;
  },

  // Install a plugin
  installPlugin: async (pluginId: string): Promise<PluginInstallation> => {
    return await apiClient.installPlugin(pluginId);
  },

  // Uninstall a plugin
  uninstallPlugin: async (installationId: string): Promise<void> => {
    await apiClient.uninstallPlugin(installationId);
  },

  // Toggle plugin status
  togglePluginStatus: async (installationId: string): Promise<PluginInstallation> => {
    // For now, we'll refetch the installation list to get updated status
    const response = await apiClient.getInstalledPlugins();
    const installation = response.results.find((i: PluginInstallation) => i.id === installationId);
    if (!installation) throw new Error('Installation not found');
    return installation;
  },

  // Configure a plugin
  configurePlugin: async (installationId: string, configuration: Record<string, unknown>): Promise<PluginInstallation> => {
    return await apiClient.configurePlugin(installationId, configuration);
  },

  // Create a new plugin
  createPlugin: async (pluginData: Omit<Plugin, 'id' | 'author' | 'download_count' | 'rating' | 'rating_count' | 'created_at' | 'updated_at'>): Promise<Plugin> => {
    return await apiClient.createPlugin(pluginData);
  },

  // Publish a plugin
  publishPlugin: async (pluginId: string): Promise<{ status: string }> => {
    return await apiClient.publishPlugin(pluginId);
  },

  // Unpublish a plugin
  unpublishPlugin: async (pluginId: string): Promise<{ status: string }> => {
    return await apiClient.unpublishPlugin(pluginId);
  },

  // Rate a plugin
  ratePlugin: async (pluginId: string, ratingData: { rating: number; review?: string }): Promise<{ status: string }> => {
    return await apiClient.ratePlugin(pluginId, ratingData);
  },
};

// React Query hooks
export const usePlugins = () => {
  return useQuery<Plugin[], Error>({
    queryKey: ['plugins'],
    queryFn: pluginApi.getAllPlugins,
  });
};

export const useInstalledPlugins = () => {
  return useQuery<PluginInstallation[], Error>({
    queryKey: ['installed-plugins'],
    queryFn: pluginApi.getInstalledPlugins,
  });
};

export const usePublicPlugins = () => {
  return useQuery<Plugin[], Error>({
    queryKey: ['public-plugins'],
    queryFn: pluginApi.getPublicPlugins,
  });
};

export const useInstallPlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PluginInstallation, Error, string>({
    mutationFn: pluginApi.installPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['installed-plugins'] });
      queryClient.invalidateQueries({ queryKey: ['public-plugins'] });
    },
  });
};

export const useUninstallPlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: pluginApi.uninstallPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['installed-plugins'] });
      queryClient.invalidateQueries({ queryKey: ['public-plugins'] });
    },
  });
};

export const useTogglePluginStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PluginInstallation, Error, string>({
    mutationFn: pluginApi.togglePluginStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-plugins'] });
    },
  });
};

export const useConfigurePlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PluginInstallation, Error, { installationId: string; configuration: Record<string, unknown> }>({
    mutationFn: ({ installationId, configuration }) => pluginApi.configurePlugin(installationId, configuration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-plugins'] });
    },
  });
};

export const useCreatePlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Plugin, Error, Omit<Plugin, 'id' | 'author' | 'download_count' | 'rating' | 'rating_count' | 'created_at' | 'updated_at'>>({
    mutationFn: pluginApi.createPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['public-plugins'] });
    },
  });
};