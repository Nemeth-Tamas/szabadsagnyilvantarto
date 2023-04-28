import { useContext } from 'react';
import { Home, MainNavbar, Messages } from './components';
import { Container } from 'react-bootstrap';
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
            <Route path='/messages' element={<Messages />} />
            <Route path='/login' element={<LoginComponent />} />
          </Routes>
        </Router>
      </Container>
    </div>
  )
}

export default App
