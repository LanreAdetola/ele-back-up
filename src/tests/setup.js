import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn()
    }))
  }
}

// Global mocks
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Global test configuration
config.global.mocks = {
  $t: (key) => key // Mock i18n
} 