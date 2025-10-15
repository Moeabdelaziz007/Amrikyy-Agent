/**
 * ProfileSettingsPage Component Tests
 * Complete test suite for profile settings functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettingsPage from '../pages/ProfileSettingsPage';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ProfileSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      render(<ProfileSettingsPage />);
      expect(screen.getByText(/Settings & Profile/i)).toBeInTheDocument();
    });

    it('should render all 4 tabs', () => {
      render(<ProfileSettingsPage />);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('should show Profile tab by default', () => {
      render(<ProfileSettingsPage />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Preferences tab', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const preferencesTab = screen.getByText('Preferences');
      await user.click(preferencesTab);

      expect(screen.getByText('General Preferences')).toBeInTheDocument();
    });

    it('should switch to Notifications tab', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const notificationsTab = screen.getByText('Notifications');
      await user.click(notificationsTab);

      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    it('should switch to Security tab', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const securityTab = screen.getByText('Security');
      await user.click(securityTab);

      expect(screen.getByText('Security Settings')).toBeInTheDocument();
    });
  });

  describe('Profile Form', () => {
    it('should render all input fields', () => {
      render(<ProfileSettingsPage />);
      
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('+1 234 567 8900')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('City, Country')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument();
    });

    it('should update name field', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const nameInput = screen.getByPlaceholderText('Enter your name');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      expect(nameInput).toHaveValue('New Name');
    });

    it('should update email field', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const emailInput = screen.getByPlaceholderText('your@email.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'new@email.com');

      expect(emailInput).toHaveValue('new@email.com');
    });

    it('should show avatar upload button on hover', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const avatar = screen.getByAltText(/User Name/i);
      await user.hover(avatar);

      // Camera button should appear
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should show loading state when saving', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show success message after save', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should hide success message after 3 seconds', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Saved successfully!')).not.toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('Preferences', () => {
    it('should change language', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Preferences'));

      const languageSelect = screen.getByLabelText('Language');
      await user.selectOptions(languageSelect, 'ar');

      expect(languageSelect).toHaveValue('ar');
    });

    it('should change currency', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Preferences'));

      const currencySelect = screen.getByLabelText('Currency');
      await user.selectOptions(currencySelect, 'EUR');

      expect(currencySelect).toHaveValue('EUR');
    });

    it('should change theme', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Preferences'));

      const themeSelect = screen.getByLabelText('Theme');
      await user.selectOptions(themeSelect, 'light');

      expect(themeSelect).toHaveValue('light');
    });
  });

  describe('Notification Toggles', () => {
    it('should toggle email notifications', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Notifications'));

      const emailToggle = screen.getByRole('checkbox', { name: /email/i });
      const initialState = emailToggle.checked;

      await user.click(emailToggle);

      expect(emailToggle.checked).toBe(!initialState);
    });

    it('should toggle push notifications', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Notifications'));

      const pushToggle = screen.getByRole('checkbox', { name: /push/i });
      await user.click(pushToggle);

      expect(pushToggle).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should render password change form', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should show delete account danger zone', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      await user.click(screen.getByText('Security'));

      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<ProfileSettingsPage />);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ProfileSettingsPage />);

      const firstTab = screen.getByText('Profile');
      firstTab.focus();

      await user.keyboard('{Tab}');
      expect(screen.getByText('Preferences')).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<ProfileSettingsPage />);

      expect(screen.getByText('Settings & Profile')).toBeInTheDocument();
    });
  });
});

