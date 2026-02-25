import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuidedProgressIndicator } from '../GuidedProgressIndicator';

describe('GuidedProgressIndicator', () => {
  it('renderiza instructionText visible cuando se provee', () => {
    render(
      <GuidedProgressIndicator
        currentStep={1}
        totalSteps={17}
        currentFieldLabel="Un centavo"
        instructionText="Ingresa la cantidad para Un centavo"
        isCompleted={false}
      />,
    );

    expect(screen.getByText('Ingresa la cantidad para Un centavo')).toBeInTheDocument();
  });

  it('usa currentFieldLabel como fallback cuando instructionText está vacío', () => {
    render(
      <GuidedProgressIndicator
        currentStep={2}
        totalSteps={17}
        currentFieldLabel="Cinco centavos"
        instructionText=""
        isCompleted={false}
      />,
    );

    expect(screen.getByText('Campo actual: Cinco centavos')).toBeInTheDocument();
  });
});
