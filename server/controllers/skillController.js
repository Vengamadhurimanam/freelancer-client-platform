const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');

// @desc    Get all skills catalog
// @route   GET /api/skills
// @access  Public
const getAllSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query).sort({ name: 1 });

    // Check which skills have assessments available
    const assessments = await Assessment.find({ isActive: true }).select('skill');
    const assessedSkillIds = new Set(assessments.map((a) => a.skill.toString()));

    const enriched = skills.map((s) => ({
      ...s.toObject(),
      hasAssessment: assessedSkillIds.has(s._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      skills: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private/Admin
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;

    const existing = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    const skill = await Skill.create({
      name,
      category,
      description,
      icon: icon || 'Code',
    });

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = async (req, res, next) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
