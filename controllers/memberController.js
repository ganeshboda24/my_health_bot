const Member = require("../models/Member");

/**
 * GET /api/members/profile
 * Return the authenticated member's own profile.
 */
async function getProfile(req, res, next) {
  try {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        member: req.member.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/members/profile
 * Update the authenticated member's own profile.
 * Password cannot be changed through this endpoint (auth change separate).
 */
async function updateProfile(req, res, next) {
  try {
    if (!req.member) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { name, preferredLanguage, age, gender } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters."
        });
      }
      updates.name = name.trim();
    }

    if (preferredLanguage !== undefined) {
      if (preferredLanguage !== "en" && preferredLanguage !== "te") {
        return res.status(400).json({
          success: false,
          message: "Preferred language must be 'en' or 'te'."
        });
      }
      updates.preferredLanguage = preferredLanguage;
    }

    if (age !== undefined) {
      const ageNum = Number(age);
      if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        return res.status(400).json({
          success: false,
          message: "Age must be between 0 and 120."
        });
      }
      updates.age = ageNum;
    }

    if (gender !== undefined) {
      if (!["male", "female", "other", ""].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: "Gender must be male, female, other, or empty."
        });
      }
      updates.gender = gender;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update."
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.memberId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        member: updatedMember.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
