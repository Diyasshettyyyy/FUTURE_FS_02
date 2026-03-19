const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, trim: true, default: '' },
  email:     { type: String, required: true, lowercase: true, trim: true },
  phone:     { type: String, trim: true, default: '' },
  company:   { type: String, trim: true, default: '' },
  source: {
    type: String,
    enum: ['website', 'referral', 'linkedin', 'email', 'cold-call', 'other'],
    default: 'website',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new',
  },
  value: { type: Number, default: 0 },
  notes: [noteSchema],
  tags: [{ type: String }],
  assignedTo: { type: String, default: 'Admin' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);