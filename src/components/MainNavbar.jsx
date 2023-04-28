import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { getUserData, logout } from '../appwrite';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../store/userSlice';

const MainNavbar = () => {
  const {theme, changeTheme} = useContext(ThemeContext);
  const [themeButton, setThemeButton] = useState("Világos");
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    // console.log(user);

    // getUserData()
    //   .then((account) => {
    //     setUser(account);
    //   })
    //   .catch((error) => {
    //     setUser(null);
    //     navigate('/login');
    //     console.log(error);
    //   });
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout()
      .then(() => {
        dispatch(logoutUser())
        navigate('/login');
      })
      .catch((error) => {
        console.log(error);
      });
  }

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
              <LinkContainer to="/messages">
                <Nav.Link>Üzenetek</Nav.Link>
              </LinkContainer>
              {user?.prefs.perms.includes("irodavezeto.approve") ? (
                <LinkContainer to="/requests">
                  <Nav.Link>Kérelmek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {user?.prefs.perms.includes("irodavezeto.list_own") || user?.prefs.perms.includes("jegyzo.list_all") ? (
                <LinkContainer to="/users">
                  <Nav.Link>Felhasználók</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
            </Nav>
            <Form className='d-flex'>
              <Button variant='outline-info' onClick={switchTheme}>{themeButton}</Button>
            </Form>
            <Nav className='px-2'>
              {user != null ? (
                <Button variant='outline-primary' onClick={handleLogout}>Kijelentkezés</Button>
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