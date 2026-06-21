import { create } from 'zustand';
import type { OrgConfig, OrgConfigInput } from '../../shared/types';
import { fetchConfig, saveConfig, uploadLogo, uploadSignature } from '../api/client';

interface ConfigState {
  config: OrgConfig | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (input: OrgConfigInput) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  uploadSignature: (file: File) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const config = await fetchConfig();
      set({ config, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  save: async (input) => {
    set({ loading: true, error: null });
    try {
      const config = await saveConfig(input);
      set({ config, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  uploadLogo: async (file) => {
    try {
      const { logoUrl } = await uploadLogo(file);
      set((state) => state.config ? { config: { ...state.config, logoUrl } } : state);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  uploadSignature: async (file) => {
    try {
      const { signatureUrl } = await uploadSignature(file);
      set((state) => state.config ? { config: { ...state.config, instructorSignatureUrl: signatureUrl } } : state);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
