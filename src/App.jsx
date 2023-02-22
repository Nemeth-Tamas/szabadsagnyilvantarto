import { useState } from 'react';
import { Home, MainNavbar, Profile } from './components';
import { Col, Container, Row } from 'react-bootstrap';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container fluid>
      <Router>
        <MainNavbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </Router>
    </Container>
  )
}

export default App
