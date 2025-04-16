import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const GET_SYMPTOMS_LIST = gql`
  query {
    symptoms {
      id
      symptoms {
        name
        severity
        duration
      }
      date
    }
  }
`;

const ADD_SYMPTOMS = gql`
  mutation AddSymptoms(
    $patientId: ID!
    $symptoms: [SymptomItemInput]!
    $additionalNotes: String
  ) {
    addSymptoms(
      patientId: $patientId
      symptoms: $symptoms
      additionalNotes: $additionalNotes
    ) {
      id
      date
    }
  }
`;

// Common symptoms for COVID-19 and RSV
const commonSymptoms = [
  { id: 'fever', name: 'Fever' },
  { id: 'cough', name: 'Cough' },
  { id: 'shortness-of-breath', name: 'Shortness of breath' },
  { id: 'fatigue', name: 'Fatigue' },
  { id: 'headache', name: 'Headache' },
  { id: 'sore-throat', name: 'Sore throat' },
  { id: 'congestion', name: 'Congestion or runny nose' },
  { id: 'nausea', name: 'Nausea or vomiting' },
  { id: 'diarrhea', name: 'Diarrhea' },
  { id: 'body-aches', name: 'Body aches' },
  { id: 'loss-of-taste-smell', name: 'Loss of taste or smell' },
  { id: 'chills', name: 'Chills' },
  { id: 'dizziness', name: 'Dizziness' }
];

const SymptomsChecklist = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomDetails, setSymptomDetails] = useState({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { loading: historyLoading, data: historyData } = useQuery(GET_SYMPTOMS_LIST);

  const [addSymptoms, { loading: mutationLoading }] = useMutation(ADD_SYMPTOMS, {
    refetchQueries: [{ query: GET_SYMPTOMS_LIST }],
    onCompleted: () => {
      setSuccess('Symptoms recorded successfully!');
      // Reset form
      setSelectedSymptoms([]);
      setSymptomDetails({});
      setAdditionalNotes('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    },
    onError: (error) => {
      setError(`Error recording symptoms: ${error.message}`);
    }
  });

  const handleSymptomToggle = (symptomId) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));

      // Remove details for this symptom
      const newDetails = { ...symptomDetails };
      delete newDetails[symptomId];
      setSymptomDetails(newDetails);
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);

      // Initialize details for this symptom
      setSymptomDetails({
        ...symptomDetails,
        [symptomId]: {
          severity: 'moderate',
          duration: ''
        }
      });
    }
  };

  const handleDetailChange = (symptomId, field, value) => {
    setSymptomDetails({
      ...symptomDetails,
      [symptomId]: {
        ...symptomDetails[symptomId],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    // Prepare symptoms data for submission
    const symptomsData = selectedSymptoms.map(id => {
      const symptom = commonSymptoms.find(s => s.id === id);
      return {
        name: symptom.name,
        severity: symptomDetails[id]?.severity || 'moderate',
        duration: symptomDetails[id]?.duration || ''
      };
    });

    try {
      await addSymptoms({
        variables: {
          patientId: user.id,
          symptoms: symptomsData,
          additionalNotes: additionalNotes || undefined
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

  return (
    <div className="page-container">
      <h1 className="mb-4">Symptoms Checklist</h1>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Select Your Symptoms</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <p>Please select all symptoms you are currently experiencing:</p>
                  <Row>
                    {commonSymptoms.map(symptom => (
                      <Col md={6} key={symptom.id}>
                        <Form.Check
                          type="checkbox"
                          id={`symptom-${symptom.id}`}
                          label={symptom.name}
                          checked={selectedSymptoms.includes(symptom.id)}
                          onChange={() => handleSymptomToggle(symptom.id)}
                          className="mb-2"
                        />
                      </Col>
                    ))}
                  </Row>
                </div>

                {selectedSymptoms.length > 0 && (
                  <div className="mb-4">
                    <h5>Symptom Details</h5>
                    {selectedSymptoms.map(symptomId => {
                      const symptom = commonSymptoms.find(s => s.id === symptomId);
                      return (
                        <Card key={symptomId} className="mb-3 symptom-card">
                          <Card.Body>
                            <Card.Title>{symptom.name}</Card.Title>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Severity</Form.Label>
                                  <Form.Select
                                    value={symptomDetails[symptomId]?.severity || 'moderate'}
                                    onChange={(e) => handleDetailChange(symptomId, 'severity', e.target.value)}
                                  >
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Duration</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="e.g., 2 days, 1 week"
                                    value={symptomDetails[symptomId]?.duration || ''}
                                    onChange={(e) => handleDetailChange(symptomId, 'duration', e.target.value)}
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <Form.Group className="mb-4" controlId="additionalNotes">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information about your symptoms or general health"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={mutationLoading || selectedSymptoms.length === 0}
                  >
                    {mutationLoading ? 'Submitting...' : 'Submit Symptoms'}
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
              <h5>Your Recent Symptom Reports</h5>
            </Card.Header>
            <Card.Body>
              {historyLoading ? (
                <p>Loading your history...</p>
              ) : historyData?.symptoms.length === 0 ? (
                <p>No previous symptom reports found.</p>
              ) : (
                <ListGroup variant="flush">
                  {historyData?.symptoms.slice(0, 3).map(record => (
                    <ListGroup.Item key={record.id}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{formatDate(record.date)}</strong>
                        <Badge bg="info">{record.symptoms.length} symptoms</Badge>
                      </div>
                      <ul className="small">
                        {record.symptoms.slice(0, 3).map((symptom, index) => (
                          <li key={index}>
                            {symptom.name}
                            <span className={`ms-1 severity-${symptom.severity}`}>
                              ({symptom.severity})
                            </span>
                          </li>
                        ))}
                        {record.symptoms.length > 3 && <li>...</li>}
                      </ul>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SymptomsChecklist;
