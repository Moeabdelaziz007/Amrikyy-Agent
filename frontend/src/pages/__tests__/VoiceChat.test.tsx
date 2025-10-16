import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceChat from '../VoiceChat';

// Mock axios
vi.mock('axios');

describe('VoiceChat Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders voice chat interface', () => {
    render(<VoiceChat />);
    
    // Check if main elements are rendered
    expect(screen.getByText(/Maya Voice Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays initial greeting message', () => {
    render(<VoiceChat />);
    
    expect(screen.getByText(/مرحباً! أنا Maya/i)).toBeInTheDocument();
  });

  it('has microphone button', () => {
    render(<VoiceChat />);
    
    const micButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg')
    );
    
    expect(micButton).toBeInTheDocument();
  });

  it('has input field for text messages', () => {
    render(<VoiceChat />);
    
    const input = screen.getByPlaceholderText(/اكتب رسالتك/i);
    expect(input).toBeInTheDocument();
  });

  it('can type in input field', () => {
    render(<VoiceChat />);
    
    const input = screen.getByPlaceholderText(/اكتب رسالتك/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'مرحبا' } });
    
    expect(input.value).toBe('مرحبا');
  });

  it('send button is disabled when input is empty', () => {
    render(<VoiceChat />);
    
    const sendButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg[class*="Send"]')
    );
    
    expect(sendButton).toBeDisabled();
  });

  it('send button is enabled when input has text', () => {
    render(<VoiceChat />);
    
    const input = screen.getByPlaceholderText(/اكتب رسالتك/i);
    fireEvent.change(input, { target: { value: 'مرحبا' } });
    
    const sendButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg[class*="Send"]')
    );
    
    expect(sendButton).not.toBeDisabled();
  });

  it('displays loading state when sending message', async () => {
    render(<VoiceChat />);
    
    const input = screen.getByPlaceholderText(/اكتب رسالتك/i);
    fireEvent.change(input, { target: { value: 'مرحبا' } });
    
    const sendButton = screen.getAllByRole('button').find(
      button => button.querySelector('svg[class*="Send"]')
    );
    
    if (sendButton) {
      fireEvent.click(sendButton);
      
      // Check for loading indicator
      await waitFor(() => {
        expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    }
  });
});
