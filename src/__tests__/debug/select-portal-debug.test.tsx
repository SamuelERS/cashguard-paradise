// 🤖 [IA] - OPERACIÓN PORTAL: Test de diagnóstico para portales Radix UI
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/lib/test-utils'
import { selectOperation, completeSecurityProtocol } from '@/__tests__/fixtures/test-helpers'
import Index from '@/pages/Index'

describe('🔍 DEBUG: Select Portal Investigation', () => {
  test('Diagnosticar renderizado de portales tras click en Select', async () => {
    console.log('🔍 [DEBUG] Starting Select Portal investigation...')

    const { user } = renderWithProviders(<Index />)

    console.log('🔍 [DEBUG] Navigating to wizard with helpers...')

    // Use existing helpers to get to the Select
    await selectOperation(user, 'evening')
    await completeSecurityProtocol(user)

    console.log('🔍 [DEBUG] Should be in wizard now - security protocol completed')

    // Should be in wizard now - find Select trigger
    console.log('🔍 [DEBUG] Looking for Select trigger...')

    // Try multiple strategies to find the Select
    let selectTrigger = screen.queryByRole('combobox')
    if (!selectTrigger) {
      console.log('🔍 [DEBUG] combobox not found, trying button with Seleccionar...')
      selectTrigger = screen.queryByRole('button', { name: /seleccionar/i })
    }
    if (!selectTrigger) {
      console.log('🔍 [DEBUG] Seleccionar button not found, trying any button...')
      const buttons = screen.getAllByRole('button')
      console.log(`🔍 [DEBUG] Found ${buttons.length} buttons:`, buttons.map(b => b.textContent))
      selectTrigger = buttons.find(b => b.textContent?.includes('Seleccionar') || b.getAttribute('aria-haspopup'))
    }

    if (!selectTrigger) {
      console.log('🔍 [DEBUG] No Select trigger found!')
      console.log('🔍 [DEBUG] DOM state before Select interaction:')
      screen.debug(document.body, 50000)
      throw new Error('Select trigger not found')
    }

    console.log('🔍 [DEBUG] Found Select trigger:', {
      tagName: selectTrigger.tagName,
      textContent: selectTrigger.textContent,
      role: selectTrigger.getAttribute('role'),
      ariaHaspopup: selectTrigger.getAttribute('aria-haspopup'),
      ariaExpanded: selectTrigger.getAttribute('aria-expanded')
    })

    // Click to open dropdown
    console.log('🔍 [DEBUG] Clicking Select trigger to open dropdown...')
    await user.click(selectTrigger)

    // Wait a moment for potential async rendering
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('🔍 [DEBUG] Checking aria-expanded after click...')
    console.log('aria-expanded:', selectTrigger.getAttribute('aria-expanded'))

    // CRITICAL: Debug complete DOM after click
    console.log('🔍 [DEBUG] === DOM SNAPSHOT AFTER SELECT CLICK ===')
    screen.debug(document.body, 100000)
    console.log('🔍 [DEBUG] === END DOM SNAPSHOT ===')

    // Try to find options in different ways
    console.log('🔍 [DEBUG] Searching for options...')

    const optionsbyText = screen.queryAllByText(/los héroes/i)
    console.log(`🔍 [DEBUG] Found ${optionsbyText.length} elements with "Los Héroes" text`)

    const selectItems = document.querySelectorAll('[role="option"]')
    console.log(`🔍 [DEBUG] Found ${selectItems.length} elements with role="option"`)

    const selectContent = document.querySelector('[data-radix-select-content]')
    console.log('🔍 [DEBUG] Select content element:', selectContent)

    if (selectContent) {
      console.log('🔍 [DEBUG] Select content innerHTML:', selectContent.innerHTML)
    }

    console.log('🔍 [DEBUG] Portal investigation complete')

    // Don't fail the test - this is just for debugging
    expect(true).toBe(true)
  })
})