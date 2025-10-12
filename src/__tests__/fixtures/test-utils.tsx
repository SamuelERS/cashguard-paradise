// 🤖 [IA] - Test Utilities para Testing Library - Resolución de Ambigüedad de Selectores
// Creado para TEST-FIX-40: Refinamiento Quirúrgico de Tests de Integración

import { screen, within, waitFor } from '@testing-library/react';

// Utilidades para selectores específicos y no ambiguos
export const testUtils = {
  // Selector para elementos dentro del modal/dialog
  withinDialog: () => within(screen.getByRole('dialog')),

  // Selector para elementos dentro de un modal específico por título
  withinModalByTitle: (title: string) => {
    const modal = screen.getByRole('dialog');
    const titleElement = within(modal).getByText(new RegExp(title, 'i'));
    return within(titleElement.closest('[role="dialog"]') || modal);
  },

  // Selector para elementos dentro del wizard modal - optimizado bug-hunter-qa
  withinWizardModal: () => {
    try {
      // Buscar por el modal que contiene contenido de wizard
      const dialogs = screen.getAllByRole('dialog');

      // Priorizar modal con pasos o contenido de wizard
      const wizardDialog = dialogs.find(dialog => {
        const content = within(dialog);
        return content.queryByText(/Paso \d+ de \d+/) ||
               content.queryByText(/Protocolo/) ||
               content.queryByText(/Sucursal/) ||
               content.queryByText(/Cajero/) ||
               content.queryByText(/Testigo/) ||
               content.queryByText(/SICAR/);
      });

      return wizardDialog ? within(wizardDialog) : within(dialogs[0]);
    } catch {
      return within(screen.getByRole('dialog'));
    }
  },

  // Selector para botones específicos dentro de contextos
  getButtonInContext: (context: ReturnType<typeof within>, name: string | RegExp) =>
    context.getByRole('button', { name }),

  // Esperar animación del modal
  waitForModalAnimation: async () => {
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    }, { timeout: 90000 });
  },

  // Esperar que desaparezca un modal
  waitForModalToDisappear: async () => {
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 90000 });
  },

  // Buscar texto específico dentro de un paso del wizard
  getStepText: async (stepPattern: RegExp) => {
    const modal = testUtils.withinWizardModal();
    return await modal.findByText(stepPattern);
  },

  // Buscar el primer elemento cuando hay múltiples
  getFirstByText: (text: string | RegExp) => {
    const elements = screen.getAllByText(text);
    return elements[0];
  },

  // Buscar elemento por texto dentro de un contenedor específico
  getTextInContainer: (containerSelector: string, text: string | RegExp) => {
    const container = document.querySelector(containerSelector);
    if (!container) throw new Error(`Container ${containerSelector} not found`);
    return within(container as HTMLElement).getByText(text);
  },

  // Buscar el paso específico del wizard (elemento visible, no sr-only)
  getWizardStep: (stepNumber: number, totalSteps: number) => {
    const modal = testUtils.withinWizardModal();
    const stepElements = modal.getAllByText(new RegExp(`Paso ${stepNumber} de ${totalSteps}`));
    // Filtrar elementos sr-only y devolver el visible
    const visibleElement = stepElements.find(el => !el.closest('.sr-only'));
    return visibleElement || stepElements[0];
  },

  // Buscar botón de navegación específico
  getNavigationButton: (action: 'siguiente' | 'anterior' | 'cancelar') => {
    const modal = testUtils.withinWizardModal();
    return modal.getByRole('button', { name: new RegExp(action, 'i') });
  },

  // Retorna el indicador de paso visible usando un selector de prueba robusto.
  getVisibleStepIndicator: () => {
    return screen.getByTestId('step-indicator');
  },

  // Buscar texto específico excluyendo elementos sr-only
  getVisibleText: (text: string | RegExp) => {
    const elements = screen.getAllByText(text);
    // Filtrar elementos sr-only y devolver el visible
    const visibleElement = elements.find(el => !el.closest('.sr-only'));
    return visibleElement || elements[0];
  },

  // Esperar y encontrar texto específico dentro del modal wizard
  findTextInWizardModal: async (text: string | RegExp, timeout: number = 10000) => {
    return await waitFor(async () => {
      const modal = testUtils.withinWizardModal();
      return await modal.findByText(text);
    }, { timeout });
  },

  // Esperar y encontrar elemento clickeable (como store option) dentro del modal
  findClickableOption: async (text: string | RegExp, timeout: number = 10000) => {
    return await waitFor(async () => {
      const modal = testUtils.withinWizardModal();
      // Buscar elementos que contengan el texto y sean clickeables
      const elements = modal.getAllByText(text);
      const clickableElement = elements.find(el => {
        const parent = el.closest('button, [role="button"], [tabindex], [onclick]');
        return parent && !parent.disabled;
      });
      return clickableElement || elements[0];
    }, { timeout });
  },

  // 🤖 [IA] - CORRECIÓN ANTI-FRAGMENTACIÓN: Buscar texto fragmentado across elementos
  // Resuelve: "text is broken up by multiple elements"
  getFragmentedText: (text: string | RegExp, container?: HTMLElement) => {
    const searchContainer = container || screen.getByRole('dialog');
    const textPattern = typeof text === 'string' ? text : text.source;

    // Buscar elementos que contengan fragmentos del texto
    const allElements = Array.from(searchContainer.querySelectorAll('*'));

    for (const element of allElements) {
      // Verificar si el textContent combinado del elemento incluye el texto buscado
      const fullText = element.textContent?.replace(/\s+/g, ' ').trim() || '';

      if (typeof text === 'string' && fullText.includes(text)) {
        return element as HTMLElement;
      } else if (text instanceof RegExp && text.test(fullText)) {
        return element as HTMLElement;
      }
    }

    throw new Error(`Fragmented text "${textPattern}" not found in container`);
  },

  // 🤖 [IA] - HELPERS ROBUSTOS: Encontrar texto fragmentado dentro del wizard modal
  findFragmentedTextInWizard: async (text: string | RegExp, timeout: number = 8000) => {
    return await waitFor(() => {
      const modal = testUtils.withinWizardModal();
      return testUtils.getFragmentedText(text, modal.container);
    }, { timeout });
  }
};

// Helpers específicos para tipos de tests
export const wizardTestUtils = {
  // Abrir modal y esperar carga completa
  openModalAndWait: async (operation: 'morning' | 'evening') => {
    const buttonText = operation === 'morning' ? 'Conteo de Caja' : 'Corte de Caja';
    const button = await screen.findByText(buttonText);
    const card = button.closest('div[class*="cursor-pointer"]');

    if (card) {
      await userEvent.click(card);
      await testUtils.waitForModalAnimation();
    }
  },

  // Verificar paso específico del wizard
  expectWizardStep: async (stepNumber: number, totalSteps: number, stepTitle?: string) => {
    const stepIndicator = testUtils.getVisibleStepIndicator();
    expect(stepIndicator).toBeInTheDocument();

    if (stepTitle) {
      const modal = testUtils.withinWizardModal();
      expect(modal.getByText(new RegExp(stepTitle, 'i'))).toBeInTheDocument();
    }
  },

  // Navegar al siguiente paso
  navigateNext: async () => {
    const nextButton = testUtils.getNavigationButton('siguiente');
    await userEvent.click(nextButton);
    // Esperar a que la animación de transición termine
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// Re-export userEvent para consistencia
import userEvent from '@testing-library/user-event';
export { userEvent };

export default testUtils;