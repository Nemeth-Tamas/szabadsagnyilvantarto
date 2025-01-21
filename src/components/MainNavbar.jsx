import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ThemeContext } from '../ThemeContext';
import { logout } from '../appwrite';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../store/userSlice';
import { functions } from '../appwrite';


const MainNavbar = () => {
  const {theme, changeTheme} = useContext(ThemeContext);
  const [themeButton, setThemeButton] = useState("Világos");
  const [kerelmekCount, setKerelmekCount] = useState(0);
  const [errorCounter, setErrorCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    handleUpdate();
  }, []);

  const handleUpdate = () => {
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GET_KERELMEK, JSON.stringify({
      submittingId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      setKerelmekCount(data.kerelmek.total);
      setErrorCounter(0);
      setLoading(false);
    })
    .catch((error) => {
      if (errorCounter < 3) {
        handleUpdate();
        setErrorCounter(errorCounter + 1);
      } else {
        console.log(error);
        setError(true);
      }
    });
  };

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
  }, [theme]);

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
              {(user && user.$id) ? (
                <LinkContainer to="/">
                  <Nav.Link>Főoldal</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {(user && user.$id) ? (
                <LinkContainer to="/messages">
                  <Nav.Link>Üzenetek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {(user && user.$id) ? (
                <LinkContainer to="/userrequests">
                  <Nav.Link>Saját kérelmek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {user?.prefs?.perms.includes("irodavezeto.approve") ? (
                <LinkContainer to="/requests">
                  <Nav.Link>Kérelmek {(kerelmekCount != 0 && !loading) ? `(${kerelmekCount})` : ""}</Nav.Link>
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
            {/* <Button variant='info' className='me-2 mt-sm-2 mt-md-0' onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}>Cache törlése</Button> */}
            <Nav>
              {(user && user.$id) ? (
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