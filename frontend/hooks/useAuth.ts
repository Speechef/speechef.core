'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { User } from '@/types';

export function useProfile() {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile/');
      return data;
    },
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
}
