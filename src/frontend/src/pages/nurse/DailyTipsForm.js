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

const GET_DAILY_TIPS = gql`
  query GetDailyTips($patientId: ID) {
    dailyTips(patientId: $patientId) {
      id
      content
      date
      isRead
      patient {
        firstName
        lastName
      }
    }
  }
`;

const ADD_DAILY_TIP = gql`
  mutation AddDailyTip($nurseId: ID!, $patientId: ID!, $content: String!) {
    addDailyTip(nurseId: $nurseId, patientId: $patientId, content: $content) {
      id
      content
      date
    }
  }
`;

const DailyTipsForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');

  const [formData, setFormData] = useState({
    patientId: patientIdFromUrl || '',
    content: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { loading: patientsLoading, data: patientsData } = useQuery(GET_PATIENTS);

  const { loading: tipsLoading, data: tipsData, refetch: refetchTips } = useQuery(GET_DAILY_TIPS, {
    variables: { patientId: formData.patientId },
    skip: !formData.patientId
  });

  const [addDailyTip, { loading: mutationLoading }] = useMutation(ADD_DAILY_TIP, {
    onCompleted: () => {
      setSuccess('Daily tip sent successfully!');
      setFormData({
        ...formData,
        content: '' // Clear only the content
      });
      refetchTips(); // Refresh the tips list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    },
    onError: (error) => {
      setError(`Error sending daily tip: ${error.message}`);
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

    if (!formData.content.trim()) {
      setError('Please enter a tip');
      return;
    }

    try {
      await addDailyTip({
        variables: {
          nurseId: user.id,
          patientId: formData.patientId,
          content: formData.content
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

  if (patientsLoading) return <p>Loading patients...</p>;

  return (
    <div className="page-container">
      <h1 className="mb-4">Daily Motivational Tips</h1>

      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Send a New Tip</h5>
            </Card.Header>
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

                <Form.Group className="mb-3" controlId="content">
                  <Form.Label>Motivational Tip</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter a motivational tip or health advice for the patient"
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={mutationLoading}
                  >
                    {mutationLoading ? 'Sending...' : 'Send Tip'}
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
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5>Previous Tips</h5>
            </Card.Header>
            <Card.Body>
              {!formData.patientId ? (
                <p>Select a patient to view previous tips.</p>
              ) : tipsLoading ? (
                <p>Loading tips...</p>
              ) : tipsData?.dailyTips.length === 0 ? (
                <p>No tips have been sent to this patient yet.</p>
              ) : (
                <div>
                  <h6>Tips for {tipsData?.dailyTips[0]?.patient.firstName} {tipsData?.dailyTips[0]?.patient.lastName}</h6>
                  {tipsData?.dailyTips.map(tip => (
                    <Card key={tip.id} className="mb-2 tip-card">
                      <Card.Body>
                        <Card.Text>{tip.content}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Sent: {formatDate(tip.date)}</small>
                          <span className={`badge ${tip.isRead ? 'bg-success' : 'bg-warning'}`}>
                            {tip.isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DailyTipsForm;
