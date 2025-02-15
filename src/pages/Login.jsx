import React, { useContext, useEffect, useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../store/userSlice';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const LoginComponent = () => {
  const {theme} = useContext(ThemeContext);
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user.$id) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault(true);
    setLoginError(false);
    let username = e.target[0].value;
    let password = e.target[1].value;
    handleLogin(username, password)
  }

  const handleLogin = async (username, password) => {
    try {
      const response = await api.post('/login', {
        email: username,
        password: password
      });
      const token = response.data.accessToken;
      const decodedUser = jwtDecode(token);
      dispatch(setUser({ token, user: decodedUser }));
      navigate('/');
    } catch (error) {
      console.error(error);
      setLoginError(true);
    }
  }

  return (
    <Container className="mt-5">
      <Alert show={loginError} variant='danger' onClose={() => setLoginError(false)} dismissible>
        Rossz felhasználónév vagy jelszó
      </Alert>
      <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
        <Card.Body>
          <Card.Title>Bejelentkezés</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='formUsername'>
              <Form.Label>Felhasználónév</Form.Label>
              <Form.Control type='username' placeholder='Felhasználónév' value='demoadmin@celldomolk.hivatal' />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formPassword'>
              <Form.Label>Jelszó</Form.Label>
              <Form.Control type='password' placeholder='Jelszó' value='testpass' />
            </Form.Group>
            <Button variant='primary' type='subbmit' className='shadow-smc'>
              Bejelentkezés
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default LoginComponent