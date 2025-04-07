const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalConditionSchema = new Schema({
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
  conditions: [{
    name: {
      type: String,
      required: true
    },
    probability: {
      type: Number,
      min: 0,
      max: 1
    },
    recommendConsultation: {
      type: Boolean,
      default: false
    }
  }],
  basedOnSymptoms: {
    type: Schema.Types.ObjectId,
    ref: 'Symptom'
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('MedicalCondition', MedicalConditionSchema);
