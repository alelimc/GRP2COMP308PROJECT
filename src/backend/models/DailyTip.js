const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DailyTipSchema = new Schema({
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('DailyTip', DailyTipSchema);
