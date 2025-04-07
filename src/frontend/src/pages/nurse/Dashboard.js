import React, { useContext } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const GET_EMERGENCY_ALERTS = gql`
  query GetEmergencyAlerts($status: String) {
    emergencyAlerts(status: $status) {
      id
      message
      location
      status
      createdAt
      patient {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_PATIENTS = gql`
  query GetPatients {
    users(role: "patient") {
      id
      firstName
      lastName
      email
    }
  }
`;

const NurseDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const { loading: alertsLoading, error: alertsError, data: alertsData } = useQuery(GET_EMERGENCY_ALERTS, {
    variables: { status: 'pending' },
    pollInterval: 10000 // Poll every 10 seconds for new alerts
  });
  
  const { loading: patientsLoading, error: patientsError, data: patientsData } = useQuery(GET_PATIENTS);

  if (alertsLoading || patientsLoading) return <p>Loading...</p>;
  if (alertsError) return <p>Error loading alerts: {alertsError.message}</p>;
  if (patientsError) return <p>Error loading patients: {patientsError.message}</p>;

  return (
    <div className="page-container">
      <h1 className="mb-4">Nurse Dashboard</h1>
      <p className="lead">Welcome, {user?.firstName} {user?.lastName}!</p>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Emergency Alerts</Card.Header>
            <Card.Body>
              {alertsData.emergencyAlerts.length === 0 ? (
                <p>No pending emergency alerts.</p>
              ) : (
                <div>
                  <p>You have {alertsData.emergencyAlerts.length} pending emergency alerts:</p>
                  {alertsData.emergencyAlerts.map(alert => (
                    <Card key={alert.id} className="mb-2 alert-card">
                      <Card.Body>
                        <Card.Title>Alert from {alert.patient.firstName} {alert.patient.lastName}</Card.Title>
                        <Card.Text>
                          <strong>Message:</strong> {alert.message}<br />
                          {alert.location && <><strong>Location:</strong> {alert.location}<br /></>}
                          <strong>Time:</strong> {new Date(alert.createdAt).toLocaleString()}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100">
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/nurse/vital-signs" variant="primary">
                  Record Vital Signs
                </Button>
                <Button as={Link} to="/nurse/daily-tips" variant="success">
                  Send Daily Tips
                </Button>
                <Button as={Link} to="/nurse/medical-conditions" variant="info">
                  Analyze Symptoms
                </Button>
                <Button as={Link} to="/nurse/previous-visits" variant="secondary">
                  View Previous Visits
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header as="h5">Your Patients</Card.Header>
        <Card.Body>
          {patientsData.users.length === 0 ? (
            <p>No patients registered yet.</p>
          ) : (
            <Row>
              {patientsData.users.map(patient => (
                <Col key={patient.id} md={4} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{patient.firstName} {patient.lastName}</Card.Title>
                      <Card.Text>
                        <strong>Email:</strong> {patient.email}
                      </Card.Text>
                      <div className="d-grid gap-2">
                        <Button 
                          as={Link} 
                          to={`/nurse/vital-signs?patientId=${patient.id}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          Record Vitals
                        </Button>
                        <Button 
                          as={Link} 
                          to={`/nurse/daily-tips?patientId=${patient.id}`} 
                          variant="outline-success" 
                          size="sm"
                        >
                          Send Tip
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NurseDashboard;
