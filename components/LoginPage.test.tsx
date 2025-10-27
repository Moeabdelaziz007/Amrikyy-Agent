import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/AppContexts';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import { fireEvent } from '@testing-library/react';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <LanguageContext.Provider value={{ lang: 'en', setLang: () => {} }}>
        <ThemeProvider>
          <LoginPage onLogin={() => {}} />
        </ThemeProvider>
      </LanguageContext.Provider>
    );
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('calls onLogin on successful login', () => {
    const handleLogin = jest.fn();
    render(
      <LanguageContext.Provider value={{ lang: 'en', setLang: () => {} }}>
        <ThemeProvider>
          <LoginPage onLogin={handleLogin} />
        </ThemeProvider>
      </LanguageContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('shows error on failed login', () => {
    render(
      <LanguageContext.Provider value={{ lang: 'en', setLang: () => {} }}>
        <ThemeProvider>
          <LoginPage onLogin={() => {}} />
        </ThemeProvider>
      </LanguageContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'user' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText("Invalid username or password. Try 'admin' and 'password'.")).toBeInTheDocument();
  });

  it('calls onLogin when guest button is clicked', () => {
    const handleLogin = jest.fn();
    render(
      <LanguageContext.Provider value={{ lang: 'en', setLang: () => {} }}>
        <ThemeProvider>
          <LoginPage onLogin={handleLogin} />
        </ThemeProvider>
      </LanguageContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login as Guest' }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
  });
});
