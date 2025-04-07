import React, { useContext } from 'react';
import { Card, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const GET_PATIENT_DATA = gql`
  query GetPatientData($patientId: ID!) {
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
      nurse {
        firstName
        lastName
      }
    }
    dailyTips(patientId: $patientId) {
      id
      content
      date
      isRead
      nurse {
        firstName
        lastName
      }
    }
    medicalConditions(patientId: $patientId) {
      id
      conditions {
        name
        probability
        recommendConsultation
      }
      date
      notes
      nurse {
        firstName
        lastName
      }
    }
  }
`;

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);

  const { loading, error, data } = useQuery(GET_PATIENT_DATA, {
    variables: { patientId: user?.id },
    skip: !user?.id
  });

  if (loading) return <p>Loading your data...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

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

  // Get the most recent vital signs
  const latestVitalSigns = data?.vitalSigns[0];

  // Get unread tips
  const unreadTips = data?.dailyTips.filter(tip => !tip.isRead);

  // Get the most recent medical condition
  const latestCondition = data?.medicalConditions[0];

  return (
    <div className="page-container">
      <h1 className="mb-4">Patient Dashboard</h1>
      <p className="lead">Welcome, {user?.firstName} {user?.lastName}!</p>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/patient/emergency-alert" variant="danger">
                  Send Emergency Alert
                </Button>
                <Button as={Link} to="/patient/daily-info" variant="primary">
                  Enter Daily Information
                </Button>
                <Button as={Link} to="/patient/symptoms" variant="info">
                  Report Symptoms
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Latest Vital Signs</Card.Header>
            <Card.Body>
              {!latestVitalSigns ? (
                <p>No vital signs recorded yet.</p>
              ) : (
                <>
                  <p><strong>Recorded on:</strong> {formatDate(latestVitalSigns.date)}</p>
                  <p><strong>By:</strong> {latestVitalSigns.nurse.firstName} {latestVitalSigns.nurse.lastName}</p>
                  <ListGroup variant="flush">
                    {latestVitalSigns.bodyTemperature && (
                      <ListGroup.Item>
                        <strong>Body Temperature:</strong> {latestVitalSigns.bodyTemperature} °C
                      </ListGroup.Item>
                    )}
                    {latestVitalSigns.heartRate && (
                      <ListGroup.Item>
                        <strong>Heart Rate:</strong> {latestVitalSigns.heartRate} bpm
                      </ListGroup.Item>
                    )}
                    {latestVitalSigns.bloodPressure?.systolic && latestVitalSigns.bloodPressure?.diastolic && (
                      <ListGroup.Item>
                        <strong>Blood Pressure:</strong> {latestVitalSigns.bloodPressure.systolic}/{latestVitalSigns.bloodPressure.diastolic} mmHg
                      </ListGroup.Item>
                    )}
                    {latestVitalSigns.respiratoryRate && (
                      <ListGroup.Item>
                        <strong>Respiratory Rate:</strong> {latestVitalSigns.respiratoryRate} breaths/min
                      </ListGroup.Item>
                    )}
                    {latestVitalSigns.weight && (
                      <ListGroup.Item>
                        <strong>Weight:</strong> {latestVitalSigns.weight} kg
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Daily Tips</Card.Header>
            <Card.Body>
              {data?.dailyTips.length === 0 ? (
                <p>No tips available yet.</p>
              ) : (
                <>
                  <p>You have {unreadTips.length} unread tips.</p>
                  {data?.dailyTips.slice(0, 3).map(tip => (
                    <Card key={tip.id} className="mb-2 tip-card">
                      <Card.Body>
                        <Card.Text>{tip.content}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            From: {tip.nurse.firstName} {tip.nurse.lastName} on {formatDate(tip.date)}
                          </small>
                          {!tip.isRead && <Badge bg="warning">New</Badge>}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Medical Conditions</Card.Header>
            <Card.Body>
              {!latestCondition ? (
                <p>No medical conditions analysis available yet.</p>
              ) : (
                <>
                  <p><strong>Analysis Date:</strong> {formatDate(latestCondition.date)}</p>
                  <p><strong>By:</strong> {latestCondition.nurse.firstName} {latestCondition.nurse.lastName}</p>

                  <h6>Possible Conditions:</h6>
                  <ListGroup className="mb-3">
                    {latestCondition.conditions.map((condition, index) => (
                      <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{condition.name}</strong>
                          <div><small>Probability: {(condition.probability * 100).toFixed(1)}%</small></div>
                        </div>
                        {condition.recommendConsultation && (
                          <Badge bg="danger">Consultation Recommended</Badge>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>

                  {latestCondition.notes && (
                    <>
                      <h6>Notes from Nurse:</h6>
                      <p>{latestCondition.notes}</p>
                    </>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientDashboard;
