import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { AuthContext } from '../../context/AuthContext';

const CREATE_EMERGENCY_ALERT = gql`
  mutation CreateEmergencyAlert($patientId: ID!, $message: String!, $location: String) {
    createEmergencyAlert(patientId: $patientId, message: $message, location: $location) {
      id
      message
      status
      createdAt
    }
  }
`;

const EmergencyAlert = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    message: '',
    location: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [createEmergencyAlert, { loading }] = useMutation(CREATE_EMERGENCY_ALERT, {
    onCompleted: () => {
      setSuccess('Emergency alert sent successfully! First responders have been notified.');
      setFormData({
        message: '',
        location: ''
      });
      
      // Navigate back to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
    },
    onError: (error) => {
      setError(`Error sending emergency alert: ${error.message}`);
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
    
    if (!formData.message.trim()) {
      setError('Please enter a message describing your emergency');
      return;
    }
    
    try {
      await createEmergencyAlert({
        variables: {
          patientId: user.id,
          message: formData.message,
          location: formData.location || undefined
        }
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };
  
  return (
    <div className="page-container">
      <h1 className="mb-4">Emergency Alert</h1>
      
      <Card className="mb-4">
        <Card.Header className="bg-danger text-white">
          <h5 className="mb-0">Send Emergency Alert</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Alert variant="warning">
            <Alert.Heading>Important Information</Alert.Heading>
            <p>
              Use this form to send an emergency alert to first responders. This should only be used in case of a medical emergency.
            </p>
            <p className="mb-0">
              If you are experiencing a life-threatening emergency, please call 911 immediately.
            </p>
          </Alert>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="message">
              <Form.Label>Emergency Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your emergency situation in detail"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="location">
              <Form.Label>Your Current Location (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Provide your current location if possible"
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button
                variant="danger"
                type="submit"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Sending Alert...' : 'Send Emergency Alert'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/patient/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmergencyAlert;
