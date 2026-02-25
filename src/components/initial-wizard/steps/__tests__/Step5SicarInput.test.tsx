import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Step5SicarInput } from '../Step5SicarInput';

describe('Step5SicarInput', () => {
  it('renderiza el resumen con sucursal y empleados sin crashear', () => {
    render(
      <Step5SicarInput
        wizardData={{
          rulesAccepted: true,
          selectedStore: 'suc-001',
          selectedCashier: 'emp-1',
          selectedWitness: 'emp-2',
          expectedSales: '123.45',
          dailyExpenses: [],
        }}
        updateWizardData={vi.fn()}
        validateInput={(value) => ({ isValid: true, cleanValue: value })}
        getPattern={() => '[0-9]*'}
        getInputMode={() => 'decimal'}
        handleNext={vi.fn()}
        canGoNext={true}
        currentStep={5}
        totalSteps={6}
        availableStores={[
          { id: 'suc-001', name: 'Sucursal Centro' },
        ]}
        availableEmployees={[
          { id: 'emp-1', name: 'Jonathan Melara', role: 'Cajero', stores: ['suc-001'] },
          { id: 'emp-2', name: 'Adonay Torres', role: 'Testigo', stores: ['suc-001'] },
        ]}
      />,
    );

    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument();
    expect(screen.getByText('Jonathan Melara')).toBeInTheDocument();
    expect(screen.getByText('Adonay Torres')).toBeInTheDocument();
  });

  it('requiere motivo para confirmar cancelación de sesión activa', async () => {
    const user = userEvent.setup();
    const onAbortSession = vi.fn().mockResolvedValue(undefined);

    render(
      <Step5SicarInput
        wizardData={{
          rulesAccepted: true,
          selectedStore: 'suc-001',
          selectedCashier: 'emp-1',
          selectedWitness: 'emp-2',
          expectedSales: '123.45',
          dailyExpenses: [],
        }}
        updateWizardData={vi.fn()}
        validateInput={(value) => ({ isValid: true, cleanValue: value })}
        getPattern={() => '[0-9]*'}
        getInputMode={() => 'decimal'}
        handleNext={vi.fn()}
        canGoNext={true}
        currentStep={5}
        totalSteps={6}
        availableStores={[
          { id: 'suc-001', name: 'Sucursal Centro' },
        ]}
        availableEmployees={[
          { id: 'emp-1', name: 'Jonathan Melara', role: 'Cajero', stores: ['suc-001'] },
          { id: 'emp-2', name: 'Adonay Torres', role: 'Testigo', stores: ['suc-001'] },
        ]}
        hasActiveSession={true}
        activeSessionSucursalId="suc-001"
        onResumeSession={vi.fn()}
        onAbortSession={onAbortSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: /abortar sesión/i }));

    const confirmButton = screen.getByRole('button', { name: /confirmar cancelación/i });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText(/motivo/i), 'Duplicidad de corte en sucursal');
    expect(confirmButton).not.toBeDisabled();

    await user.click(confirmButton);
    expect(onAbortSession).toHaveBeenCalledWith('Duplicidad de corte en sucursal');
  });
});
