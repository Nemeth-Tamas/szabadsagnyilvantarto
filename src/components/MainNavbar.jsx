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
    // if (!user || !user.$id) {
    //   navigate('/login');
    // }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("logging out");
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
      <Navbar bg={theme} variant={theme} expand="md">
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
              {user?.prefs?.perms.includes("irodavezeto.approve") ? (
                <LinkContainer to="/requests">
                  <Nav.Link>Kérelmek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {user?.prefs?.perms.includes("irodavezeto.list_own") || user?.prefs?.perms.includes("jegyzo.list_all") ? (
                <LinkContainer to="/users">
                  <Nav.Link>Felhasználók</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
            </Nav>
            <Form className='d-flex pe-2'>
              <Button variant='outline-info' onClick={switchTheme}>{themeButton}</Button>
            </Form>
            <Nav>
              {user != null ? (
                <Button variant='outline-primary' className='me-auto mt-sm-2 mt-md-0' onClick={handleLogout}>Kijelentkezés</Button>
              ) : ""}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default MainNavbar