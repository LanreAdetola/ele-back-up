import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AdminProducts from '@/views/admin/AdminProducts.vue'
import { supabase } from '@/lib/supabase'

describe('AdminProducts.vue', () => {
  let wrapper

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Mock admin user
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })

    // Mock admin check
    supabase.from.mockImplementation(() => ({
      select: () => ({
        maybeSingle: () => ({
          data: { user_id: 'test-user-id' }
        })
      })
    }))

    wrapper = mount(AdminProducts, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn
        })]
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('shows add product button for admin users', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').text()).toContain('Add Product')
  })

  it('validates product form', async () => {
    const productForm = {
      name: '',
      price: '',
      description: ''
    }

    wrapper.vm.productForm = productForm
    await wrapper.vm.handleSubmit()

    expect(wrapper.vm.errorMessage).toBeTruthy()
  })

  it('handles image upload', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const event = { target: { files: [file] } }

    supabase.storage.from.mockImplementation(() => ({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    }))

    await wrapper.vm.handleImageUpload(event)
    expect(wrapper.vm.productForm.image_url).toBe('test-url')
  })
}) 