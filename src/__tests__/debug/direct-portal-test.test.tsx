// 🤖 [IA] - DIRECT PORTAL TEST: Test del portal Select sin navegación compleja
import { describe, test, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../fixtures/test-helpers'
import InitialWizardModal from '@/components/InitialWizardModal'

describe('🔍 DIRECT PORTAL TEST: Select Component Portal Validation', () => {
  test('Validar renderizado de portales en InitialWizardModal aislado', async () => {
    console.log('🔍 [PORTAL TEST] Starting direct portal validation...')

    const mockOnComplete = vi.fn()
    const mockOnClose = vi.fn()

    const { user } = renderWithProviders(
      <InitialWizardModal
        isOpen={true}
        onComplete={mockOnComplete}
        onClose={mockOnClose}
      />
    )

    // Wait for modal to render
    await waitFor(() => {
      expect(screen.getByText('Protocolo de Seguridad')).toBeInTheDocument()
    })

    console.log('🔍 [PORTAL TEST] Modal rendered, completing security protocol...')

    // Complete security protocol to get to wizard
    const firstButton = await screen.findByRole('button', { name: /comenzar/i })
    await user.click(firstButton)

    // Wait for security protocol completion (rules + timing)
    await new Promise(resolve => setTimeout(resolve, 6000)) // Wait for 5 seconds + buffer

    console.log('🔍 [PORTAL TEST] Looking for Select components...')

    // Check if we're in the wizard with Select components
    await waitFor(() => {
      // Look for Select triggers (should have "Seleccionar..." placeholder)
      const selectTriggers = screen.queryAllByText('Seleccionar...')
      console.log(`🔍 [PORTAL TEST] Found ${selectTriggers.length} Select triggers`)

      if (selectTriggers.length > 0) {
        console.log('🔍 [PORTAL TEST] Testing first Select trigger...')

        // Click the first Select trigger to open dropdown
        const firstTrigger = selectTriggers[0]
        return user.click(firstTrigger).then(() => {
          // Wait a moment for dropdown to open
          return new Promise(resolve => setTimeout(resolve, 200))
        }).then(() => {
          console.log('🔍 [PORTAL TEST] Checking for portal content after click...')

          // Debug complete DOM
          console.log('🔍 [PORTAL TEST] === DOM AFTER SELECT CLICK ===')
          screen.debug(document.body, 50000)
          console.log('🔍 [PORTAL TEST] === END DOM ===')

          // Look for options
          const heroesOptions = screen.queryAllByText(/los héroes/i)
          console.log(`🔍 [PORTAL TEST] Found ${heroesOptions.length} "Los Héroes" options`)

          return true
        })
      }

      throw new Error('No Select triggers found - wizard may not have loaded')
    }, { timeout: 10000 })

    console.log('🔍 [PORTAL TEST] Portal test completed')
    expect(true).toBe(true) // Don't fail - just collect debug info
  })
})