import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const GET_PATIENTS = gql`
  query GetPatients {
    users(role: "patient") {
      id
      firstName
      lastName
    }
  }
`;

const GET_PATIENT_SYMPTOMS = gql`
  query GetPatientSymptoms($patientId: ID) {
    symptoms(patientId: $patientId) {
      id
      symptoms {
        name
        severity
        duration
      }
      additionalNotes
      date
    }
  }
`;

const GET_PATIENT_VITAL_SIGNS = gql`
  query GetPatientVitalSigns($patientId: ID!) {
    vitalSigns(patientId: $patientId) {
      bodyTemperature
      heartRate
      bloodPressure {
        systolic
        diastolic
      }
      respiratoryRate
      date
    }
  }
`;

const PREDICT_CONDITIONS = gql`
  mutation PredictConditions($symptoms: [String]!, $vitalSigns: [Float]!) {
    predictConditions(symptoms: $symptoms, vitalSigns: $vitalSigns) {
      name
      probability
      recommendConsultation
    }
  }
`;

const ADD_MEDICAL_CONDITION = gql`
  mutation AddMedicalCondition(
    $patientId: ID!
    $nurseId: ID!
    $conditions: [ConditionItemInput]!
    $basedOnSymptoms: ID
    $notes: String
  ) {
    addMedicalCondition(
      patientId: $patientId
      nurseId: $nurseId
      conditions: $conditions
      basedOnSymptoms: $basedOnSymptoms
      notes: $notes
    ) {
      id
    }
  }
`;

const MedicalConditions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedSymptomRecord, setSelectedSymptomRecord] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { loading: patientsLoading, data: patientsData } = useQuery(GET_PATIENTS);

  const { loading: symptomsLoading, data: symptomsData, refetch: refetchSymptoms } = useQuery(GET_PATIENT_SYMPTOMS, {
    variables: { patientId: selectedPatient },
    skip: !selectedPatient,
    pollInterval: 1000 
  });

  const { loading: vitalSignsLoading, data: vitalSignsData } = useQuery(GET_PATIENT_VITAL_SIGNS, {
    variables: { patientId: selectedPatient },
    skip: !selectedPatient,
    pollInterval: 1000 
  });

  const [predictConditions, { loading: predictLoading }] = useMutation(PREDICT_CONDITIONS, {
    onCompleted: (data) => {
      setPredictions(data.predictConditions);
      console.log('Predictions:', data.predictConditions);
    },
    onError: (error) => {
      setError(`Error predicting conditions: ${error.message}`);
    }
  });

  const [addMedicalCondition, { loading: savingLoading }] = useMutation(ADD_MEDICAL_CONDITION, {
    onCompleted: () => {
      setSuccess('Medical conditions saved successfully!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    },
    onError: (error) => {
      setError(`Error saving medical conditions: ${error.message}`);
    }
  });

  const handlePatientChange = async (e) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
    setSelectedSymptomRecord('');
    setPredictions([]);

  if (patientId) {
    try {
      await refetchSymptoms(); // Manually refetch symptoms for the selected patient
    } catch (error) {
      console.error('Error refetching symptoms:', error);
    }
  }
  };

  const handleSymptomRecordChange = (e) => {
    setSelectedSymptomRecord(e.target.value);
    setPredictions([]);
  };

  const handleAnalyzeSymptoms = async () => {
    setError('');

    console.log('selectedPatient:', selectedPatient);
    console.log('vitalSignsData:', vitalSignsData);
    console.log('vitalSignsData.vitalSigns:', vitalSignsData?.vitalSigns);

    console.log('symptomsData:', symptomsData);
    console.log('symptomsData.symptoms:', symptomsData?.symptoms);

    if (!vitalSignsData || !vitalSignsData.vitalSigns) {
      setError('No vital signs data available for the selected patient');
      return;
    }

    // Sort vitalSigns by date in descending order and pick the most recent record
    const recentVitalSigns = [...vitalSignsData.vitalSigns].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('recentVitalSigns:', recentVitalSigns);

    if (!selectedSymptomRecord) {
      setError('Please select a symptom record to analyze');
      return;
    }

    if (!symptomsData || !symptomsData.symptoms) {
      setError('No symptom data available');
      return;
    }

    console.log('selectedSymptomRecord:', selectedSymptomRecord);
    const symptomRecord = symptomsData.symptoms.find(s => s.id === selectedSymptomRecord);
    console.log('symptomRecord:', symptomRecord);
    
    if (!symptomRecord) {
      setError('Selected symptom record not found');
      return;
    }

    const symptomNames = symptomRecord.symptoms.map(s => s.name);
    console.log('symptomNames:', symptomNames);

    const vitalSigns = [
      recentVitalSigns.bodyTemperature || 0,
      recentVitalSigns.heartRate || 0,
      recentVitalSigns.bloodPressure?.systolic || 0,
      recentVitalSigns.bloodPressure?.diastolic || 0,
      recentVitalSigns.respiratoryRate || 0
    ];
    console.log('vitalSigns:', vitalSigns);

    try {
      // Show a loading message
      setPredictions([{ name: 'Analyzing symptoms...', probability: 0, recommendConsultation: false }]);

      await predictConditions({
        variables: {
          symptoms: symptomNames,
          vitalSigns: vitalSigns
        }
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
      // If there's an error with the AI service, provide some fallback predictions
      setPredictions([
        { name: 'Common Cold', probability: 0.7, recommendConsultation: false },
        { name: 'Influenza', probability: 0.5, recommendConsultation: true },
        { name: 'COVID-19', probability: 0.3, recommendConsultation: true }
      ]);
    }
  };

  const handleSaveConditions = async () => {
    setError('');

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    if (predictions.length === 0) {
      setError('Please analyze symptoms first to get predictions');
      return;
    }

    try {
      await addMedicalCondition({
        variables: {
          patientId: selectedPatient,
          nurseId: user.id,
          conditions: predictions.map(p => ({
            name: p.name,
            probability: p.probability,
            recommendConsultation: p.recommendConsultation
          })),
          basedOnSymptoms: selectedSymptomRecord,
          notes: notes
        }
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';

    // Try to parse the date in different formats
    let date;

    try {
      // If it's an ISO string or MongoDB date
      date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try to handle MongoDB ISODate format
        if (typeof dateString === 'string' && dateString.includes('Z')) {
          // Extract the date part if it's in a complex format
          const matches = dateString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
          if (matches) {
            date = new Date(matches[0]);
          }
        }
      }

      // Final check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'Invalid date';
      }

      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'mild':
        return <Badge bg="success">Mild</Badge>;
      case 'moderate':
        return <Badge bg="warning">Moderate</Badge>;
      case 'severe':
        return <Badge bg="danger">Severe</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="page-container">
      <h1 className="mb-4">Medical Conditions Analysis</h1>

      <Card className="mb-4">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="patientSelect">
                  <Form.Label>Select Patient</Form.Label>
                  <Form.Select
                    value={selectedPatient}
                    onChange={handlePatientChange}
                    disabled={patientsLoading}
                  >
                    <option value="">Select a patient</option>
                    {patientsData?.users.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="symptomRecordSelect">
                  <Form.Label>Select Symptom Record</Form.Label>
                  <Form.Select
                    value={selectedSymptomRecord}
                    onChange={handleSymptomRecordChange}
                    disabled={!selectedPatient || symptomsLoading}
                  >
                    <option value="">Select a symptom record</option>
                    {symptomsData?.symptoms.map(record => (
                      <option key={record.id} value={record.id}>
                        {formatDate(record.date)} ({record.symptoms.length} symptoms)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              onClick={handleAnalyzeSymptoms}
              disabled={!selectedSymptomRecord || symptomsLoading || predictLoading}
              className="mb-3"
            >
              {predictLoading ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {selectedSymptomRecord && symptomsData && (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Symptoms</h5>
              </Card.Header>
              <Card.Body>
                {symptomsData.symptoms
                  .filter(record => record.id === selectedSymptomRecord)
                  .map(record => (
                    <div key={record.id}>
                      <p><strong>Date:</strong> {formatDate(record.date)}</p>
                      <ListGroup className="mb-3">
                        {record.symptoms.map((symptom, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{symptom.name}</strong>
                              {symptom.duration && <div><small>Duration: {symptom.duration}</small></div>}
                            </div>
                            {getSeverityBadge(symptom.severity)}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                      {record.additionalNotes && (
                        <div>
                          <strong>Additional Notes:</strong>
                          <p>{record.additionalNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5>Predicted Conditions</h5>
              </Card.Header>
              <Card.Body>
                {predictions.length === 0 ? (
                  <p>Click "Analyze Symptoms" to get predictions.</p>
                ) : (
                  <>
                    <ListGroup className="mb-3">
                      {predictions.map((condition, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{condition.name}</strong>
                            <div><small>Probability: {(condition.probability * 100).toFixed(1)}%</small></div>
                          </div>
                          {condition.recommendConsultation ? (
                            <Badge bg="danger">Consultation Recommended</Badge>
                          ) : (
                            <Badge bg="success">No Consultation Needed</Badge>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <Form.Group className="mb-3" controlId="notes">
                      <Form.Label>Notes for Patient</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes or recommendations for the patient"
                      />
                    </Form.Group>

                    <Button
                      variant="success"
                      onClick={handleSaveConditions}
                      disabled={savingLoading}
                      className="w-100"
                    >
                      {savingLoading ? 'Saving...' : 'Save Analysis Results'}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default MedicalConditions;
