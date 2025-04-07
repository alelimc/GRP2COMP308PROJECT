const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLEnumType
} = graphql;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models
const User = require('../models/User');
const VitalSigns = require('../models/VitalSigns');
const DailyTip = require('../models/DailyTip');
const EmergencyAlert = require('../models/EmergencyAlert');
const Symptom = require('../models/Symptom');
const MedicalCondition = require('../models/MedicalCondition');
const axios = require('axios');

// Define types
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    dateOfBirth: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.dateOfBirth ? parent.dateOfBirth.toISOString() : null;
      }
    },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.createdAt ? parent.createdAt.toISOString() : null;
      }
    }
  })
});

const AuthType = new GraphQLObjectType({
  name: 'Auth',
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType }
  })
});

const BloodPressureType = new GraphQLObjectType({
  name: 'BloodPressure',
  fields: () => ({
    systolic: { type: GraphQLInt },
    diastolic: { type: GraphQLInt }
  })
});

const VitalSignsType = new GraphQLObjectType({
  name: 'VitalSigns',
  fields: () => ({
    id: { type: GraphQLID },
    patientId: { type: GraphQLID },
    nurseId: { type: GraphQLID },
    bodyTemperature: { type: GraphQLFloat },
    heartRate: { type: GraphQLInt },
    bloodPressure: { type: BloodPressureType },
    respiratoryRate: { type: GraphQLInt },
    weight: { type: GraphQLFloat },
    date: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.date ? parent.date.toISOString() : null;
      }
    },
    notes: { type: GraphQLString },
    patient: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.patientId);
      }
    },
    nurse: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.nurseId);
      }
    }
  })
});

const DailyTipType = new GraphQLObjectType({
  name: 'DailyTip',
  fields: () => ({
    id: { type: GraphQLID },
    nurseId: { type: GraphQLID },
    patientId: { type: GraphQLID },
    content: { type: GraphQLString },
    date: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.date ? parent.date.toISOString() : null;
      }
    },
    isRead: { type: GraphQLBoolean },
    nurse: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.nurseId);
      }
    },
    patient: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.patientId);
      }
    }
  })
});

const EmergencyAlertType = new GraphQLObjectType({
  name: 'EmergencyAlert',
  fields: () => ({
    id: { type: GraphQLID },
    patientId: { type: GraphQLID },
    message: { type: GraphQLString },
    location: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.createdAt ? parent.createdAt.toISOString() : null;
      }
    },
    resolvedAt: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.resolvedAt ? parent.resolvedAt.toISOString() : null;
      }
    },
    patient: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.patientId);
      }
    }
  })
});

const SymptomItemType = new GraphQLObjectType({
  name: 'SymptomItem',
  fields: () => ({
    name: { type: GraphQLString },
    severity: { type: GraphQLString },
    duration: { type: GraphQLString }
  })
});

const SymptomType = new GraphQLObjectType({
  name: 'Symptom',
  fields: () => ({
    id: { type: GraphQLID },
    patientId: { type: GraphQLID },
    symptoms: { type: new GraphQLList(SymptomItemType) },
    additionalNotes: { type: GraphQLString },
    date: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.date ? parent.date.toISOString() : null;
      }
    },
    patient: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.patientId);
      }
    }
  })
});

const ConditionItemType = new GraphQLObjectType({
  name: 'ConditionItem',
  fields: () => ({
    name: { type: GraphQLString },
    probability: { type: GraphQLFloat },
    recommendConsultation: { type: GraphQLBoolean }
  })
});

const MedicalConditionType = new GraphQLObjectType({
  name: 'MedicalCondition',
  fields: () => ({
    id: { type: GraphQLID },
    patientId: { type: GraphQLID },
    nurseId: { type: GraphQLID },
    conditions: { type: new GraphQLList(ConditionItemType) },
    basedOnSymptoms: { type: GraphQLID },
    date: {
      type: GraphQLString,
      resolve(parent) {
        // Ensure date is properly formatted as ISO string
        return parent.date ? parent.date.toISOString() : null;
      }
    },
    notes: { type: GraphQLString },
    patient: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.patientId);
      }
    },
    nurse: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.nurseId);
      }
    },
    symptomData: {
      type: SymptomType,
      resolve(parent, args) {
        return Symptom.findById(parent.basedOnSymptoms);
      }
    }
  })
});

// Input Types
const BloodPressureInputType = new GraphQLInputObjectType({
  name: 'BloodPressureInput',
  fields: {
    systolic: { type: GraphQLInt },
    diastolic: { type: GraphQLInt }
  }
});

const SymptomItemInputType = new GraphQLInputObjectType({
  name: 'SymptomItemInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    severity: { type: GraphQLString },
    duration: { type: GraphQLString }
  }
});

const ConditionItemInputType = new GraphQLInputObjectType({
  name: 'ConditionItemInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    probability: { type: GraphQLFloat },
    recommendConsultation: { type: GraphQLBoolean }
  }
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args, context) {
        return User.findById(args.id);
      }
    },
    users: {
      type: new GraphQLList(UserType),
      args: { role: { type: GraphQLString } },
      resolve(parent, args) {
        if (args.role) {
          return User.find({ role: args.role });
        }
        return User.find({});
      }
    },
    vitalSigns: {
      type: new GraphQLList(VitalSignsType),
      args: { patientId: { type: GraphQLID } },
      resolve(parent, args) {
        if (args.patientId) {
          return VitalSigns.find({ patientId: args.patientId }).sort({ date: -1 });
        }
        return VitalSigns.find({}).sort({ date: -1 });
      }
    },
    vitalSign: {
      type: VitalSignsType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return VitalSigns.findById(args.id);
      }
    },
    dailyTips: {
      type: new GraphQLList(DailyTipType),
      args: { patientId: { type: GraphQLID } },
      resolve(parent, args) {
        if (args.patientId) {
          return DailyTip.find({ patientId: args.patientId }).sort({ date: -1 });
        }
        return DailyTip.find({}).sort({ date: -1 });
      }
    },
    emergencyAlerts: {
      type: new GraphQLList(EmergencyAlertType),
      args: { status: { type: GraphQLString } },
      resolve(parent, args) {
        if (args.status) {
          return EmergencyAlert.find({ status: args.status }).sort({ createdAt: -1 });
        }
        return EmergencyAlert.find({}).sort({ createdAt: -1 });
      }
    },
    symptoms: {
      type: new GraphQLList(SymptomType),
      args: { patientId: { type: GraphQLID } },
      resolve(parent, args) {
        if (args.patientId) {
          return Symptom.find({ patientId: args.patientId }).sort({ date: -1 });
        }
        return Symptom.find({}).sort({ date: -1 });
      }
    },
    symptom: {
      type: SymptomType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Symptom.findById(args.id);
      }
    },
    medicalConditions: {
      type: new GraphQLList(MedicalConditionType),
      args: { patientId: { type: GraphQLID } },
      resolve(parent, args) {
        if (args.patientId) {
          return MedicalCondition.find({ patientId: args.patientId }).sort({ date: -1 });
        }
        return MedicalCondition.find({}).sort({ date: -1 });
      }
    }
  }
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // User mutations
    registerUser: {
      type: AuthType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        dateOfBirth: { type: GraphQLString }
      },
      async resolve(parent, args) {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: args.email });
          if (user) {
            throw new Error('User already exists');
          }

          // Create new user
          user = new User({
            username: args.username,
            email: args.email,
            password: args.password,
            role: args.role,
            firstName: args.firstName,
            lastName: args.lastName,
            dateOfBirth: args.dateOfBirth
          });

          // Hash password
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(args.password, salt);

          // Save user
          await user.save();

          // Create JWT token
          const payload = {
            user: {
              id: user.id,
              role: user.role
            }
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

          return { token, user };
        } catch (err) {
          throw new Error(err.message);
        }
      }
    },
    loginUser: {
      type: AuthType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args) {
        try {
          // Check if user exists
          const user = await User.findOne({ email: args.email });
          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Check password
          const isMatch = await bcrypt.compare(args.password, user.password);
          if (!isMatch) {
            throw new Error('Invalid credentials');
          }

          // Create JWT token
          const payload = {
            user: {
              id: user.id,
              role: user.role
            }
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

          return { token, user };
        } catch (err) {
          throw new Error(err.message);
        }
      }
    },
    // VitalSigns mutations
    addVitalSigns: {
      type: VitalSignsType,
      args: {
        patientId: { type: new GraphQLNonNull(GraphQLID) },
        nurseId: { type: new GraphQLNonNull(GraphQLID) },
        bodyTemperature: { type: GraphQLFloat },
        heartRate: { type: GraphQLInt },
        bloodPressure: { type: BloodPressureInputType },
        respiratoryRate: { type: GraphQLInt },
        weight: { type: GraphQLFloat },
        notes: { type: GraphQLString }
      },
      resolve(parent, args) {
        const vitalSigns = new VitalSigns({
          patientId: args.patientId,
          nurseId: args.nurseId,
          bodyTemperature: args.bodyTemperature,
          heartRate: args.heartRate,
          bloodPressure: args.bloodPressure,
          respiratoryRate: args.respiratoryRate,
          weight: args.weight,
          notes: args.notes
        });
        return vitalSigns.save();
      }
    },
    // DailyTip mutations
    addDailyTip: {
      type: DailyTipType,
      args: {
        nurseId: { type: new GraphQLNonNull(GraphQLID) },
        patientId: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        const dailyTip = new DailyTip({
          nurseId: args.nurseId,
          patientId: args.patientId,
          content: args.content
        });
        return dailyTip.save();
      }
    },
    markTipAsRead: {
      type: DailyTipType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        return DailyTip.findByIdAndUpdate(
          args.id,
          { isRead: true },
          { new: true }
        );
      }
    },
    // EmergencyAlert mutations
    createEmergencyAlert: {
      type: EmergencyAlertType,
      args: {
        patientId: { type: new GraphQLNonNull(GraphQLID) },
        message: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: GraphQLString }
      },
      resolve(parent, args) {
        const emergencyAlert = new EmergencyAlert({
          patientId: args.patientId,
          message: args.message,
          location: args.location
        });
        return emergencyAlert.save();
      }
    },
    updateAlertStatus: {
      type: EmergencyAlertType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        const updates = { status: args.status };
        if (args.status === 'resolved') {
          updates.resolvedAt = new Date();
        }
        return EmergencyAlert.findByIdAndUpdate(
          args.id,
          updates,
          { new: true }
        );
      }
    },
    // Symptom mutations
    addSymptoms: {
      type: SymptomType,
      args: {
        patientId: { type: new GraphQLNonNull(GraphQLID) },
        symptoms: { type: new GraphQLList(SymptomItemInputType) },
        additionalNotes: { type: GraphQLString }
      },
      resolve(parent, args) {
        const symptom = new Symptom({
          patientId: args.patientId,
          symptoms: args.symptoms,
          additionalNotes: args.additionalNotes
        });
        return symptom.save();
      }
    },
    // MedicalCondition mutations
    addMedicalCondition: {
      type: MedicalConditionType,
      args: {
        patientId: { type: new GraphQLNonNull(GraphQLID) },
        nurseId: { type: new GraphQLNonNull(GraphQLID) },
        conditions: { type: new GraphQLList(ConditionItemInputType) },
        basedOnSymptoms: { type: GraphQLID },
        notes: { type: GraphQLString }
      },
      resolve(parent, args) {
        const medicalCondition = new MedicalCondition({
          patientId: args.patientId,
          nurseId: args.nurseId,
          conditions: args.conditions,
          basedOnSymptoms: args.basedOnSymptoms,
          notes: args.notes
        });
        return medicalCondition.save();
      }
    },
    // AI prediction
    predictConditions: {
      type: new GraphQLList(ConditionItemType),
      args: {
        symptoms: { type: new GraphQLList(GraphQLString) }
      },
      async resolve(parent, args) {
        try {
          // Try to connect to the AI service
          const response = await axios.post(process.env.AI_SERVICE_URL + '/predict', {
            symptoms: args.symptoms
          });
          return response.data.predictions;
        } catch (err) {
          console.error('Error connecting to AI service:', err.message);

          // Fallback: If AI service is unavailable, return mock predictions
          console.log('Using fallback predictions');
          return [
            { name: 'Common Cold', probability: 0.7, recommendConsultation: false },
            { name: 'Influenza', probability: 0.5, recommendConsultation: true },
            { name: 'COVID-19', probability: 0.3, recommendConsultation: true },
            { name: 'Allergies', probability: 0.2, recommendConsultation: false },
            { name: 'Bronchitis', probability: 0.1, recommendConsultation: true }
          ];
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
