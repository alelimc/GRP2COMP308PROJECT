const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VitalSignsSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bodyTemperature: {
    type: Number
  },
  heartRate: {
    type: Number
  },
  bloodPressure: {
    systolic: {
      type: Number
    },
    diastolic: {
      type: Number
    }
  },
  respiratoryRate: {
    type: Number
  },
  weight: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('VitalSigns', VitalSignsSchema);
