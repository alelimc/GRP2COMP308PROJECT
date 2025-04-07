import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-light">
      <Container className="text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Healthcare Monitoring System | COMP308 Group Project
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
