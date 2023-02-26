import React, { useContext, useState } from 'react'
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const LoginComponent = () => {
  const {login} = useContext(UserContext);
  const {theme} = useContext(ThemeContext);
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(true);
    setLoginError(false);
    let username = e.target[0].value;
    let password = e.target[1].value;
    handleLogin(username, password)
  }

  const handleLogin = (username, password) => {
    try {
      let success = login(username, password);
      navigate('/');
    } catch (error) {
      setLoginError(true);
    }
  }

  return (
    <Container className="mt-5">
      <Alert show={loginError} variant='danger' onClose={() => setLoginError(false)} dismissible>
        Rossz felhasználónév vagy jelszó
      </Alert>
      <Card bg={theme} text={theme == "light" ? "dark" : "light"}>
        <Card.Body>
          <Card.Title>Bejelentkezés</Card.Title>
          <Card.Text>
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
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default LoginComponent