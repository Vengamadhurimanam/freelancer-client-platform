const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Submit report
// @route   POST /api/reports
// @access  Private
const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description, evidence } = req.body;

    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, targetId, reason, and description',
      });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      description,
      evidence: evidence || '',
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will investigate shortly.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reporter', 'name email avatar')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status / resolve (Admin)
// @route   PATCH /api/reports/:id
// @access  Private/Admin
const updateReport = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || report.status;
    if (adminNotes) report.adminNotes = adminNotes;
    if (status === 'Resolved' || status === 'Dismissed') {
      report.resolvedBy = req.user.id;
      report.resolvedAt = new Date();
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: `Report marked as ${report.status}`,
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
  getAllReports,
  updateReport,
};
