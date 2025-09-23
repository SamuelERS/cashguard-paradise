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

  // Selector para elementos dentro del wizard modal
  withinWizardModal: () => {
    try {
      // Buscar por el modal que contiene wizard content
      const dialogs = screen.getAllByRole('dialog');
      const wizardDialog = dialogs.find(dialog =>
        within(dialog).queryByText(/Paso \d+ de \d+/) !== null
      );
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
    }, { timeout: 3000 });
  },

  // Esperar que desaparezca un modal
  waitForModalToDisappear: async () => {
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }, { timeout: 3000 });
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

  // Buscar el paso específico del wizard
  getWizardStep: (stepNumber: number, totalSteps: number) => {
    const modal = testUtils.withinWizardModal();
    return modal.getByText(new RegExp(`Paso ${stepNumber} de ${totalSteps}`));
  },

  // Buscar botón de navegación específico
  getNavigationButton: (action: 'siguiente' | 'anterior' | 'cancelar') => {
    const modal = testUtils.withinWizardModal();
    return modal.getByRole('button', { name: new RegExp(action, 'i') });
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
    const modal = testUtils.withinWizardModal();
    expect(modal.getByText(new RegExp(`Paso ${stepNumber} de ${totalSteps}`))).toBeInTheDocument();

    if (stepTitle) {
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