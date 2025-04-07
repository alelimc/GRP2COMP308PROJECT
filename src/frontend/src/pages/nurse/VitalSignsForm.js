import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
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

const ADD_VITAL_SIGNS = gql`
  mutation AddVitalSigns(
    $patientId: ID!
    $nurseId: ID!
    $bodyTemperature: Float
    $heartRate: Int
    $bloodPressure: BloodPressureInput
    $respiratoryRate: Int
    $weight: Float
    $notes: String
  ) {
    addVitalSigns(
      patientId: $patientId
      nurseId: $nurseId
      bodyTemperature: $bodyTemperature
      heartRate: $heartRate
      bloodPressure: $bloodPressure
      respiratoryRate: $respiratoryRate
      weight: $weight
      notes: $notes
    ) {
      id
      date
    }
  }
`;

const VitalSignsForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');
  
  const [formData, setFormData] = useState({
    patientId: patientIdFromUrl || '',
    bodyTemperature: '',
    heartRate: '',
    systolic: '',
    diastolic: '',
    respiratoryRate: '',
    weight: '',
    notes: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { loading: patientsLoading, data: patientsData } = useQuery(GET_PATIENTS);
  
  const [addVitalSigns, { loading: mutationLoading }] = useMutation(ADD_VITAL_SIGNS, {
    onCompleted: () => {
      setSuccess('Vital signs recorded successfully!');
      // Reset form
      setFormData({
        patientId: formData.patientId, // Keep the selected patient
        bodyTemperature: '',
        heartRate: '',
        systolic: '',
        diastolic: '',
        respiratoryRate: '',
        weight: '',
        notes: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    },
    onError: (error) => {
      setError(`Error recording vital signs: ${error.message}`);
    }
  });
  
  useEffect(() => {
    if (patientIdFromUrl) {
      setFormData(prev => ({ ...prev, patientId: patientIdFromUrl }));
    }
  }, [patientIdFromUrl]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    
    // Validate at least one vital sign is entered
    if (
      !formData.bodyTemperature &&
      !formData.heartRate &&
      (!formData.systolic || !formData.diastolic) &&
      !formData.respiratoryRate &&
      !formData.weight
    ) {
      setError('Please enter at least one vital sign');
      return;
    }
    
    // Prepare variables for mutation
    const variables = {
      patientId: formData.patientId,
      nurseId: user.id,
      notes: formData.notes || undefined
    };
    
    // Add vital signs if provided
    if (formData.bodyTemperature) variables.bodyTemperature = parseFloat(formData.bodyTemperature);
    if (formData.heartRate) variables.heartRate = parseInt(formData.heartRate);
    if (formData.respiratoryRate) variables.respiratoryRate = parseInt(formData.respiratoryRate);
    if (formData.weight) variables.weight = parseFloat(formData.weight);
    
    // Add blood pressure if both systolic and diastolic are provided
    if (formData.systolic && formData.diastolic) {
      variables.bloodPressure = {
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic)
      };
    }
    
    try {
      await addVitalSigns({ variables });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };
  
  if (patientsLoading) return <p>Loading patients...</p>;
  
  return (
    <div className="page-container">
      <h1 className="mb-4">Record Vital Signs</h1>
      
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="patientId">
              <Form.Label>Select Patient</Form.Label>
              <Form.Select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
              >
                <option value="">Select a patient</option>
                {patientsData?.users.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="bodyTemperature">
                  <Form.Label>Body Temperature (°C)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="bodyTemperature"
                    value={formData.bodyTemperature}
                    onChange={handleChange}
                    placeholder="36.5"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="heartRate">
                  <Form.Label>Heart Rate (bpm)</Form.Label>
                  <Form.Control
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    placeholder="75"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="bloodPressure">
                  <Form.Label>Blood Pressure (mmHg)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        name="systolic"
                        value={formData.systolic}
                        onChange={handleChange}
                        placeholder="Systolic (120)"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        name="diastolic"
                        value={formData.diastolic}
                        onChange={handleChange}
                        placeholder="Diastolic (80)"
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="respiratoryRate">
                  <Form.Label>Respiratory Rate (breaths/min)</Form.Label>
                  <Form.Control
                    type="number"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleChange}
                    placeholder="16"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="weight">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70.5"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional observations or notes"
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={mutationLoading}
              >
                {mutationLoading ? 'Saving...' : 'Save Vital Signs'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/nurse/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VitalSignsForm;
