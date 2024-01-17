import { useContext } from 'react';
import { Home, Messages, UserRequests, Requests, Login, UsersList, UserEdit, Plan } from './pages';
import { MainNavbar } from './components';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import './App.css';

function App() {
  const {theme} = useContext(ThemeContext);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Container fluid className={theme == "dark" ? "bg-semidark" : ""} style={{ minHeight: '100vh' }}>
        <Router>
          <MainNavbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/userrequests' element={<UserRequests />} />
            <Route path='/login' element={<Login />} />
            <Route path='/requests' element={<Requests />} />
            <Route path='/users' element={<UsersList />} />
            <Route path='/useredit' element={<UserEdit />} />
            <Route path='/plan' element={<Plan />} />
          </Routes>
        </Router>
      </Container>
    </div>
  )
}

export default App
