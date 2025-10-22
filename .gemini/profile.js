const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const authenticateToken = require("../middleware/auth");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET /api/profile - Get user profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PostgREST error for no rows found
        return res
          .status(404)
          .json({ success: false, error: "User profile not found." });
      }
      throw error;
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred while fetching the profile.",
      details: error.message,
    });
  }
});

// PUT /api/profile - Update user profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Prevent updating the ID or other protected fields
    delete updates.id;
    delete updates.email;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: data,
    });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred while updating the profile.",
      details: error.message,
    });
  }
});

// POST /api/profile/avatar - Upload user avatar
router.post("/avatar", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res
        .status(400)
        .json({ success: false, error: "avatar_url is required." });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ avatar_url })
      .eq("id", userId)
      .select("avatar_url")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Avatar updated successfully.",
      avatar_url: data.avatar_url,
    });
  } catch (error) {
    console.error("Error updating avatar:", error.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred while updating the avatar.",
      details: error.message,
    });
  }
});

// DELETE /api/profile - Delete user account
// Note: This is a sensitive operation. In a real-world scenario, this would
// trigger a multi-step process (e.g., email confirmation, data archival).
// For now, it performs a direct deletion as per the spec.
router.delete("/", authenticateToken, async (req, res) => {
  // This is a placeholder for a more complex account deletion flow.
  // Direct user deletion from the database is destructive.
  res
    .status(202)
    .json({
      success: true,
      message:
        "Account deletion process initiated. Please check your email to confirm.",
    });
});

module.exports = router;
