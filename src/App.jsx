import { useContext, useState } from 'react';
import { Home, MainNavbar, Profile } from './components';
import { Col, Container, Row } from 'react-bootstrap';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import LoginComponent from './components/LoginComponent';

function App() {
  const {theme} = useContext(ThemeContext);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Container fluid className={theme == "dark" ? "bg-secondary" : ""} style={{ minHeight: '100vh' }}>
        <Router>
          <MainNavbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<LoginComponent />} />
          </Routes>
        </Router>
      </Container>
    </div>
  )
}

export default App
