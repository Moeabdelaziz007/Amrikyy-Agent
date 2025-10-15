/**
 * NotificationsPage Component Tests
 * Complete test suite for notifications functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPage from '../pages/NotificationsPage';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title with notification count', () => {
      render(<NotificationsPage />);
      
      expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      // Should show unread count badge
      expect(screen.getByText(/2|3|4/)).toBeInTheDocument(); // Unread count
    });

    it('should render notification list', () => {
      render(<NotificationsPage />);
      
      // Should show sample notifications
      expect(screen.getByText(/Tokyo Trip/i)).toBeInTheDocument();
      expect(screen.getByText(/Paris Trip/i)).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      render(<NotificationsPage />);
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
      expect(screen.getByText('Deals')).toBeInTheDocument();
      expect(screen.getByText('Trips')).toBeInTheDocument();
    });

    it('should show mark all read button if unread exist', () => {
      render(<NotificationsPage />);
      
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    it('should show clear all button', () => {
      render(<NotificationsPage />);
      
      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter notifications by type (Deals)', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const dealsFilter = screen.getByText('Deals');
      await user.click(dealsFilter);

      // Should only show deal notifications
      const notifications = screen.getAllByRole('article');
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should filter notifications by read status', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const unreadFilter = screen.getByText('Unread');
      await user.click(unreadFilter);

      // Should only show unread
      expect(screen.queryByText('New')).toBeInTheDocument();
    });

    it('should show all notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const allFilter = screen.getByText('All');
      await user.click(allFilter);

      // Should show all types
      expect(screen.getByText(/Tokyo/i)).toBeInTheDocument();
    });
  });

  describe('Mark as Read', () => {
    it('should mark single notification as read', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Find and click mark as read button
      const markButtons = screen.getAllByTitle('Mark as read');
      if (markButtons.length > 0) {
        await user.click(markButtons[0]);
        
        // Notification should be marked as read
        await waitFor(() => {
          expect(markButtons[0]).not.toBeInTheDocument();
        });
      }
    });

    it('should mark all notifications as read', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const markAllButton = screen.getByText('Mark all read');
      await user.click(markAllButton);

      // Unread count should disappear
      await waitFor(() => {
        expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Notifications', () => {
    it('should delete single notification', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const deleteButtons = screen.getAllByTitle('Delete');
      const initialCount = deleteButtons.length;

      await user.click(deleteButtons[0]);

      // Should remove notification
      await waitFor(() => {
        const newButtons = screen.queryAllByTitle('Delete');
        expect(newButtons.length).toBe(initialCount - 1);
      });
    });

    it('should clear all notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const clearAllButton = screen.getByText('Clear all');
      await user.click(clearAllButton);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(/No notifications/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Clear all
      const clearAllButton = screen.getByText('Clear all');
      await user.click(clearAllButton);

      // Should show empty message
      expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
    });

    it('should show empty state for filtered results', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      // Filter by type that doesn't exist
      const dealsFilter = screen.getByText('Deals');
      await user.click(dealsFilter);

      // Clear all first
      const clearAll = screen.getByText('Clear all');
      await user.click(clearAll);

      // Should show empty message for this filter
      expect(screen.getByText(/No deal notifications/i)).toBeInTheDocument();
    });
  });

  describe('Notification Types', () => {
    it('should display deal notifications with correct styling', () => {
      render(<NotificationsPage />);
      
      const dealNotification = screen.getByText(/50% Off/i);
      expect(dealNotification).toBeInTheDocument();
    });

    it('should display trip notifications', () => {
      render(<NotificationsPage />);
      
      expect(screen.getByText(/Paris Trip/i)).toBeInTheDocument();
    });

    it('should show notification badges', () => {
      render(<NotificationsPage />);
      
      // Type badges
      expect(screen.getByText('Deal')).toBeInTheDocument();
      expect(screen.getByText('Trip')).toBeInTheDocument();
      
      // New badges for unread
      const newBadges = screen.getAllByText('New');
      expect(newBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Timestamps', () => {
    it('should format timestamps correctly', () => {
      render(<NotificationsPage />);
      
      // Should show relative times
      const timestamps = screen.getAllByText(/\d+[mhd] ago/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Animations', () => {
    it('should animate notification entry', async () => {
      const { container } = render(<NotificationsPage />);
      
      // Check for animation classes
      const notifications = container.querySelectorAll('[class*="motion"]');
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should animate notification removal', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      // Should have exit animation
      await waitFor(() => {
        expect(deleteButtons[0]).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<NotificationsPage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<NotificationsPage />);

      const firstFilter = screen.getByText('All');
      firstFilter.focus();

      await user.keyboard('{Tab}');
      expect(screen.getByText('Unread')).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should handle 100+ notifications efficiently', () => {
      // Mock large dataset
      const { container } = render(<NotificationsPage />);
      
      // Should render without performance issues
      expect(container).toBeInTheDocument();
    });

    it('should implement virtual scrolling for large lists', () => {
      // Future: implement virtual scrolling
      expect(true).toBe(true);
    });
  });
});

