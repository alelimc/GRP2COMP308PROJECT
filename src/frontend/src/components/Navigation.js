import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Healthcare Monitoring System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && user?.role === 'nurse' && (
              <>
                <Nav.Link as={Link} to="/nurse/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/nurse/vital-signs">Record Vital Signs</Nav.Link>
                <Nav.Link as={Link} to="/nurse/previous-visits">Previous Visits</Nav.Link>
                <Nav.Link as={Link} to="/nurse/daily-tips">Daily Tips</Nav.Link>
                <Nav.Link as={Link} to="/nurse/medical-conditions">Medical Conditions</Nav.Link>
              </>
            )}
            {isAuthenticated && user?.role === 'patient' && (
              <>
                <Nav.Link as={Link} to="/patient/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/patient/emergency-alert">Emergency Alert</Nav.Link>
                <Nav.Link as={Link} to="/patient/daily-info">Daily Information</Nav.Link>
                <Nav.Link as={Link} to="/patient/symptoms">Symptoms Checklist</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  Signed in as: <span className="fw-bold">{user?.firstName} {user?.lastName}</span>
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
