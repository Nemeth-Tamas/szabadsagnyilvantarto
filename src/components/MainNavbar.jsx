import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { UserContext } from '../UserContext';

const MainNavbar = () => {
  const {theme, changeTheme} = useContext(ThemeContext);
  const {isLoggedIn, logout} = useContext(UserContext);
  const [themeButton, setThemeButton] = useState("Világos");

  const switchTheme = () => {
    if (theme == "light") {
      changeTheme("dark");
      setThemeButton("Sötét");
    } else {
      changeTheme("light");
      setThemeButton("Világos");
    }
  }

  useEffect(() => {
    if (theme == "light") {
      setThemeButton("Sötét");
    } else {
      setThemeButton("Világos");
    }
  }, [])

  return (
    <>
      <Navbar bg={theme} variant={theme}>
        <Container>
          <Navbar.Brand>Szabadság nyilvántartó</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              <LinkContainer to="/">
                <Nav.Link>Főoldal</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/profile">
                <Nav.Link>Profile</Nav.Link>
              </LinkContainer>
            </Nav>
            <Form className='d-flex'>
              <Button variant='outline-info' onClick={switchTheme}>{themeButton}</Button>
            </Form>
            <Nav className='px-2'>
              {isLoggedIn ? (
                <Button variant='outline-primary' onClick={logout}>Kijelentkezés</Button>
              ) : (
                <LinkContainer to="/login">
                  <Button variant='outline-primary'>
                    Bejelentkezés
                  </Button>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default MainNavbar