// Footer.js

import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={footerContentStyle}>
        <div>
          <FooterTitle title="About" />
          <FooterLinkGroup>
            <FooterLink href="#">Advision Research</FooterLink>
            <FooterLink href="#">AI</FooterLink>
          </FooterLinkGroup>
        </div>
        <div>
          <FooterTitle title="Follow us" />
          <FooterLinkGroup>
            <FooterLink href="#">Github</FooterLink>
            <FooterLink href="#">Discord</FooterLink>
          </FooterLinkGroup>
        </div>
        <div>
          <FooterTitle title="Legal" />
          <FooterLinkGroup>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms & Conditions</FooterLink>
          </FooterLinkGroup>
        </div>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Advision Research
      </p>
    </footer>
  );
};

const footerStyle = {
  textAlign: 'center',
  padding: '0.7rem', // Adjusted padding
  height: '150px', // Example specific height
  backgroundColor: '#333',
  color: '#fff',
  position: 'fixed',
  bottom: '-25px',
  width: '100%',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', // Centers content vertically if there's space
};

const footerContentStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
};

const FooterTitle = ({ title }) => (
  <h4 style={{ color: '#fff', marginBottom: '0.1rem', fontSize: '1rem' }}>{title}</h4>
);

const FooterLinkGroup = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {children}
  </div>
);

const FooterLink = ({ href, children }) => (
  <a
    href={href}
    style={{
      color: '#fff',
      textDecoration: 'none',
      margin: '0.1rem',
      display: 'block',
    }}
  >
    {children}
  </a>
);

export default Footer;