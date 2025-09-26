// 🤖 [IA] - SIMPLE NAVIGATION DEBUG: Test navegación directa al wizard
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/lib/test-utils'
import Index from '@/pages/Index'

describe('🔍 DEBUG: Simple Navigation', () => {
  test('Navegar desde pantalla inicial hasta wizard modal', async () => {
    console.log('🔍 [DEBUG] Starting simple navigation test...')

    const { user } = renderWithProviders(<Index />)

    // Step 1: Verify initial screen
    console.log('🔍 [DEBUG] Checking initial screen...')
    expect(screen.getByText('Seleccione Operación')).toBeInTheDocument()
    console.log('🔍 [DEBUG] Initial screen confirmed')

    // Step 2: Find and click evening operation
    console.log('🔍 [DEBUG] Looking for Corte de Caja card...')
    const corteCard = screen.getByText('Corte de Caja')
    expect(corteCard).toBeInTheDocument()

    const cardContainer = corteCard.closest('div.cursor-pointer')
    console.log('🔍 [DEBUG] Found card container:', cardContainer?.className)

    // Click the card
    console.log('🔍 [DEBUG] Clicking evening operation card...')
    await user.click(cardContainer as HTMLElement)

    // Wait for modal to appear
    await new Promise(resolve => setTimeout(resolve, 500))

    // Step 3: Check if modal appeared
    console.log('🔍 [DEBUG] Looking for wizard modal...')
    console.log('🔍 [DEBUG] DOM after card click:')
    screen.debug(document.body, 20000)

    // Look for common modal indicators
    const modalElements = [
      screen.queryByText('Protocolo de Seguridad'),
      screen.queryByText('Acuarios Paradise'),
      screen.queryByRole('dialog'),
      document.querySelector('[data-radix-dialog-content]'),
      document.querySelector('[role="dialog"]')
    ]

    console.log('🔍 [DEBUG] Modal search results:')
    modalElements.forEach((el, i) => {
      console.log(`  ${i}: ${el ? 'FOUND' : 'NOT FOUND'} - ${el?.textContent?.slice(0, 50)}`)
    })

    expect(true).toBe(true) // Don't fail the test, just collect info
  })
})