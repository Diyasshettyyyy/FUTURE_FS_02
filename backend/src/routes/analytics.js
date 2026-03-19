const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const [statusCounts, sourceCounts, totalValue, recentLeads] = await Promise.all([
      Lead.aggregate([{ $match: { createdBy: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: { createdBy: userId } }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: { createdBy: userId } }, { $group: { _id: null, total: { $sum: '$value' } } }]),
      Lead.find({ createdBy: userId }).sort('-createdAt').limit(5).select('firstName lastName email status source createdAt'),
    ]);
    const total = await Lead.countDocuments({ createdBy: userId });
    const converted = statusCounts.find(s => s._id === 'converted')?.count || 0;
    res.json({
      total,
      statusCounts: Object.fromEntries(statusCounts.map(s => [s._id, s.count])),
      sourceCounts: Object.fromEntries(sourceCounts.map(s => [s._id, s.count])),
      totalValue: totalValue[0]?.total || 0,
      conversionRate: total ? Math.round((converted / total) * 100) : 0,
      recentLeads,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const data = await Lead.aggregate([
      { $match: { createdBy: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          value: { $sum: '$value' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;