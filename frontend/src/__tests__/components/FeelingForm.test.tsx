// __tests__/components/FeelingForm.test.tsx
// Component tests for FeelingForm using React Testing Library + jest-environment-jsdom

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the API module so tests never make real HTTP calls
jest.mock('@/lib/api', () => ({
  createFeeling: jest.fn().mockResolvedValue({
    feelingID: 1,
    userID: 1,
    feeling: 'Happy',
    subject: '',
    context: '',
    timestamp: new Date().toISOString(),
  }),
}));

// Mock lucide-react to avoid ESM issues in Jest
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon" />,
}));

// Import the component AFTER mocks are set up
import FeelingForm from '@/components/feelings/FeelingForm';

describe('FeelingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<FeelingForm />);
    // The form label and submit button should be present
    expect(screen.getByRole('form', { name: /log a feeling/i })).toBeInTheDocument();
  });

  it('renders the feeling autocomplete input', () => {
    render(<FeelingForm />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Type to search feelings...');
  });

  it('renders partner user toggle buttons', () => {
    render(<FeelingForm />);
    expect(screen.getByRole('button', { name: /partner 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /partner 2/i })).toBeInTheDocument();
  });

  it('renders Subject and Context inputs', () => {
    render(<FeelingForm />);
    expect(screen.getByPlaceholderText(/what is this feeling about/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/share a little more/i)).toBeInTheDocument();
  });

  it('renders the Save Feeling submit button', () => {
    render(<FeelingForm />);
    expect(screen.getByRole('button', { name: /save feeling/i })).toBeInTheDocument();
  });

  it('typing in the autocomplete input filters the dropdown', async () => {
    const user = userEvent.setup();
    render(<FeelingForm />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'hap');

    // Dropdown listbox should appear with filtered options
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();

    // "Happy" should be one of the visible options
    expect(screen.getByRole('option', { name: /happy/i })).toBeInTheDocument();
  });

  it('selecting a feeling from the dropdown populates the input', async () => {
    const user = userEvent.setup();
    render(<FeelingForm />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'hap');

    const happyOption = await screen.findByRole('option', { name: /happy/i });
    await user.click(happyOption);

    // The input should now display the selected value
    expect(input).toHaveValue('Happy');

    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows a validation error when submitting without a feeling selected', async () => {
    const user = userEvent.setup();
    render(<FeelingForm />);

    // Submit without selecting a feeling
    const submitButton = screen.getByRole('button', { name: /save feeling/i });
    await user.click(submitButton);

    // Validation error message should appear
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent(/please select a feeling/i);
  });

  it('partner toggle switches correctly', async () => {
    const user = userEvent.setup();
    render(<FeelingForm />);

    const partner1Button = screen.getByRole('button', { name: /partner 1/i });
    const partner2Button = screen.getByRole('button', { name: /partner 2/i });

    // Partner 1 should be selected by default (aria-pressed="true")
    expect(partner1Button).toHaveAttribute('aria-pressed', 'true');
    expect(partner2Button).toHaveAttribute('aria-pressed', 'false');

    // Click Partner 2
    await user.click(partner2Button);

    expect(partner2Button).toHaveAttribute('aria-pressed', 'true');
    expect(partner1Button).toHaveAttribute('aria-pressed', 'false');
  });

  it('typing then clearing resets the dropdown', async () => {
    const user = userEvent.setup();
    render(<FeelingForm />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'sad');

    // Dropdown should open
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    // Clear the input using the X button
    const clearButton = screen.getByRole('button', { name: /clear feeling selection/i });
    await user.click(clearButton);

    // Input should be empty and dropdown gone
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
