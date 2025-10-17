/**
 * ChatPage Arabic Language Support Tests
 * Tests bilingual functionality and RTL support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChatPage from '../ChatPage';

const renderChatPage = () => {
  return render(
    <BrowserRouter>
      <ChatPage />
    </BrowserRouter>
  );
};

describe('ChatPage - Arabic Language Support', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Default Language', () => {
    it('should default to Arabic language', () => {
      renderChatPage();
      
      // Check for Arabic greeting
      expect(screen.getByText(/مرحباً/)).toBeInTheDocument();
      expect(screen.getByText(/أمريكي/)).toBeInTheDocument();
    });

    it('should save Arabic as default in localStorage', () => {
      renderChatPage();
      
      expect(localStorage.getItem('chatLanguage')).toBe('ar');
    });

    it('should display Arabic UI labels', () => {
      renderChatPage();
      
      expect(screen.getByText(/مساعدك في تخطيط السفر/)).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('should have a language toggle button', () => {
      renderChatPage();
      
      const toggleButton = screen.getByTitle(/Switch to English/);
      expect(toggleButton).toBeInTheDocument();
    });

    it('should switch to English when toggle is clicked', async () => {
      renderChatPage();
      
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
        expect(screen.getByText(/Amrikyy AI/)).toBeInTheDocument();
      });
    });

    it('should update localStorage when language changes', async () => {
      renderChatPage();
      
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('chatLanguage')).toBe('en');
      });
    });

    it('should toggle back to Arabic', async () => {
      renderChatPage();
      
      // Switch to English
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
      });
      
      // Switch back to Arabic
      const toggleBackButton = screen.getByTitle(/التبديل إلى العربية/);
      fireEvent.click(toggleBackButton);
      
      await waitFor(() => {
        expect(screen.getByText(/مرحباً/)).toBeInTheDocument();
      });
    });
  });

  describe('RTL Support', () => {
    it('should apply RTL direction for Arabic', () => {
      renderChatPage();
      
      const container = screen.getByText(/مرحباً/).closest('.gradient-bg');
      expect(container).toHaveAttribute('dir', 'rtl');
    });

    it('should apply LTR direction for English', async () => {
      renderChatPage();
      
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const container = screen.getByText(/Hello/).closest('.gradient-bg');
        expect(container).toHaveAttribute('dir', 'ltr');
      });
    });
  });

  describe('Greeting Message Update', () => {
    it('should update greeting when switching to English', async () => {
      renderChatPage();
      
      // Initial Arabic greeting
      expect(screen.getByText(/مرحباً/)).toBeInTheDocument();
      
      // Switch to English
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/مرحباً/)).not.toBeInTheDocument();
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
      });
    });

    it('should maintain message history when switching languages', async () => {
      renderChatPage();
      
      // Switch language
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        // Should still have one message (greeting)
        const messages = screen.getAllByRole('article', { hidden: true });
        expect(messages.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Persistent Language Preference', () => {
    it('should remember language preference on reload', () => {
      // Set English preference
      localStorage.setItem('chatLanguage', 'en');
      
      renderChatPage();
      
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
      expect(screen.queryByText(/مرحباً/)).not.toBeInTheDocument();
    });

    it('should remember Arabic preference on reload', () => {
      // Set Arabic preference
      localStorage.setItem('chatLanguage', 'ar');
      
      renderChatPage();
      
      expect(screen.getByText(/مرحباً/)).toBeInTheDocument();
      expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
    });
  });

  describe('UI Labels Translation', () => {
    it('should translate workflow labels to Arabic', () => {
      renderChatPage();
      
      expect(screen.getByText(/سير عمل الذكاء الاصطناعي/)).toBeInTheDocument();
    });

    it('should translate workflow labels to English', async () => {
      renderChatPage();
      
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/AI Workflow/)).toBeInTheDocument();
      });
    });

    it('should translate button labels correctly', async () => {
      renderChatPage();
      
      // Arabic labels
      expect(screen.getByText(/عرض سير العمل|إخفاء سير العمل/)).toBeInTheDocument();
      
      // Switch to English
      const toggleButton = screen.getByTitle(/Switch to English/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Show Workflow|Hide Workflow/)).toBeInTheDocument();
      });
    });
  });
});
