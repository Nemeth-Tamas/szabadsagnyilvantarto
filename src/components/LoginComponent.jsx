import React, { useContext, useEffect, useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { getUserData, login } from "../appwrite";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../store/userSlice';

const LoginComponent = () => {
  const {theme} = useContext(ThemeContext);
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault(true);
    setLoginError(false);
    let username = e.target[0].value;
    let password = e.target[1].value;
    handleLogin(username, password)
  }

  const handleLogin = (username, password) => {
    login(username, password)
    .then(account => {
      getUserData()
      .then(acc => {
        dispatch(setUser(acc));
      })
      .catch(error => {
        console.log(error);
      });
      navigate('/');
    })
    .catch(error => {
      console.log(error);
      setLoginError(true);
    })
  }

  return (
    <Container className="mt-5">
      <Alert show={loginError} variant='danger' onClose={() => setLoginError(false)} dismissible>
        Rossz felhasználónév vagy jelszó
      </Alert>
      <Card bg={theme} text={theme == "light" ? "dark" : "light"}>
        <Card.Body>
          <Card.Title>Bejelentkezés</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='formUsername'>
              <Form.Label>Felhasználónév</Form.Label>
              <Form.Control type='username' placeholder='Felhasználónév' />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formPassword'>
              <Form.Label>Jelszó</Form.Label>
              <Form.Control type='password' placeholder='Jelszó' />
            </Form.Group>
            <Button variant='primary' type='subbmit'>
              Bejelentkezés
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default LoginComponent