import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const GET_VITAL_SIGNS = gql`
  query GetVitalSigns($patientId: ID) {
    vitalSigns(patientId: $patientId) {
      id
      bodyTemperature
      heartRate
      bloodPressure {
        systolic
        diastolic
      }
      respiratoryRate
      weight
      date
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

const DailyInfoForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const { loading: historyLoading, data: historyData } = useQuery(GET_VITAL_SIGNS, {
    variables: { patientId: user?.id },
    skip: !user?.id
  });

  const [addVitalSigns, { loading: mutationLoading }] = useMutation(ADD_VITAL_SIGNS, {
    onCompleted: () => {
      setSuccess('Daily information recorded successfully!');
      // Reset form
      setFormData({
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
      setError(`Error recording information: ${error.message}`);
    }
  });

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
      patientId: user.id,
      nurseId: user.id, // Self-reporting, so use the same ID
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

  // Get the most recent vital signs for reference
  const latestVitalSigns = historyData?.vitalSigns[0];

  return (
    <div className="page-container">
      <h1 className="mb-4">Daily Information</h1>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Enter Today's Information</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
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
                    placeholder="How are you feeling today? Any additional information you want to share?"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={mutationLoading}
                  >
                    {mutationLoading ? 'Saving...' : 'Save Information'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/patient/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5>Your Previous Readings</h5>
            </Card.Header>
            <Card.Body>
              {historyLoading ? (
                <p>Loading your history...</p>
              ) : historyData?.vitalSigns.length === 0 ? (
                <p>No previous readings found.</p>
              ) : (
                <>
                  <p><strong>Last recorded on:</strong> {formatDate(latestVitalSigns.date)}</p>
                  <ul className="list-unstyled">
                    {latestVitalSigns.bodyTemperature && (
                      <li><strong>Body Temperature:</strong> {latestVitalSigns.bodyTemperature} °C</li>
                    )}
                    {latestVitalSigns.heartRate && (
                      <li><strong>Heart Rate:</strong> {latestVitalSigns.heartRate} bpm</li>
                    )}
                    {latestVitalSigns.bloodPressure?.systolic && latestVitalSigns.bloodPressure?.diastolic && (
                      <li><strong>Blood Pressure:</strong> {latestVitalSigns.bloodPressure.systolic}/{latestVitalSigns.bloodPressure.diastolic} mmHg</li>
                    )}
                    {latestVitalSigns.respiratoryRate && (
                      <li><strong>Respiratory Rate:</strong> {latestVitalSigns.respiratoryRate} breaths/min</li>
                    )}
                    {latestVitalSigns.weight && (
                      <li><strong>Weight:</strong> {latestVitalSigns.weight} kg</li>
                    )}
                  </ul>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DailyInfoForm;
