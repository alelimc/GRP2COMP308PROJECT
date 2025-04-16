import React, { useState } from 'react';
import { Card, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { useQuery, gql } from '@apollo/client';

const GET_PATIENTS = gql`
  query GetPatients {
    users(role: "patient") {
      id
      firstName
      lastName
    }
  }
`;

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
      notes
      patient {
        firstName
        lastName
      }
      nurse {
        firstName
        lastName
      }
    }
  }
`;

const PreviousVisits = () => {
  const [selectedPatient, setSelectedPatient] = useState('');

  const { loading: patientsLoading, data: patientsData } = useQuery(GET_PATIENTS);

  const { loading: vitalsLoading, data: vitalsData, refetch } = useQuery(GET_VITAL_SIGNS, {
    variables: { patientId: selectedPatient },
    skip: !selectedPatient,
    pollInterval: 1000
  });

  const handlePatientChange = async (e) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);

  if (patientId) {
    try {
      await refetch(); // Manually refetch the query when a patient is selected
    } catch (error) {
      console.error('Error refetching vital signs:', error);
    }
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
      <h1 className="mb-4">Previous Clinical Visits</h1>

      <Card className="mb-4">
        <Card.Body>
          <Form>
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
          </Form>
        </Card.Body>
      </Card>

      {selectedPatient ? (
        vitalsLoading ? (
          <p>Loading vital signs data...</p>
        ) : vitalsData?.vitalSigns.length === 0 ? (
          <Card>
            <Card.Body>
              <p className="text-center">No vital signs records found for this patient.</p>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header>
              <h5>Vital Signs History for {vitalsData?.vitalSigns[0]?.patient.firstName} {vitalsData?.vitalSigns[0]?.patient.lastName}</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Temperature (°C)</th>
                      <th>Heart Rate (bpm)</th>
                      <th>Blood Pressure (mmHg)</th>
                      <th>Respiratory Rate</th>
                      <th>Weight (kg)</th>
                      <th>Notes</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsData?.vitalSigns.map(record => (
                      <tr key={record.id}>
                        <td>{formatDate(record.date)}</td>
                        <td>
                          {record.bodyTemperature ? (
                            <Badge bg={record.bodyTemperature > 37.5 ? 'danger' : 'success'}>
                              {record.bodyTemperature}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                        <td>
                          {record.heartRate ? (
                            <Badge bg={record.heartRate > 100 || record.heartRate < 60 ? 'warning' : 'success'}>
                              {record.heartRate}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                        <td>
                          {record.bloodPressure?.systolic && record.bloodPressure?.diastolic ? (
                            <Badge bg={record.bloodPressure.systolic > 140 || record.bloodPressure.diastolic > 90 ? 'danger' : 'success'}>
                              {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                        <td>
                          {record.respiratoryRate ? (
                            <Badge bg={record.respiratoryRate > 20 || record.respiratoryRate < 12 ? 'warning' : 'success'}>
                              {record.respiratoryRate}
                            </Badge>
                          ) : 'N/A'}
                        </td>
                        <td>{record.weight || 'N/A'}</td>
                        <td>{record.notes || 'No notes'}</td>
                        <td>{record.nurse.firstName} {record.nurse.lastName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )
      ) : (
        <Card>
          <Card.Body>
            <p className="text-center">Please select a patient to view their vital signs history.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PreviousVisits;
