const request = require("supertest");
const express = require("express");
const notificationsRouter = require("../../backend/routes/notifications"); // Assuming the path

// Mock Supabase and middleware
jest.mock("../../backend/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

const { supabase } = require("../../backend/database/supabase");

const app = express();
app.use(express.json());
// Mock authenticateToken middleware
app.use((req, res, next) => {
  req.user = { id: "test-user-id" };
  next();
});
app.use("/api/notifications", notificationsRouter);

describe("Notifications API Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for GET /api/notifications
  describe("GET /api/notifications", () => {
    it("should fetch notifications for the user", async () => {
      const mockNotifications = [{ id: 1, message: "Test Notification" }];
      supabase.order.mockResolvedValue({
        data: mockNotifications,
        error: null,
      });

      const res = await request(app).get("/api/notifications");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notifications).toEqual(mockNotifications);
      expect(supabase.from).toHaveBeenCalledWith("notifications");
      expect(supabase.eq).toHaveBeenCalledWith("user_id", "test-user-id");
    });
  });

  // Test for POST /api/notifications/mark-read
  describe("POST /api/notifications/mark-read", () => {
    it("should mark notifications as read", async () => {
      const notificationIds = [1, 2];
      supabase.update.mockResolvedValue({ error: null });

      const res = await request(app)
        .post("/api/notifications/mark-read")
        .send({ ids: notificationIds });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("notifications");
      expect(supabase.in).toHaveBeenCalledWith("id", notificationIds);
      expect(supabase.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(supabase.update).toHaveBeenCalledWith({ read: true });
    });
  });

  // Test for DELETE /api/notifications/:id
  describe("DELETE /api/notifications/:id", () => {
    it("should delete a notification", async () => {
      supabase.delete.mockResolvedValue({ error: null });

      const res = await request(app).delete("/api/notifications/1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("notifications");
      expect(supabase.eq).toHaveBeenCalledWith("id", "1");
      expect(supabase.eq).toHaveBeenCalledWith("user_id", "test-user-id");
    });
  });
});
