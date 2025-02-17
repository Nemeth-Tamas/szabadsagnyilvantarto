import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from './LinkContainer';
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectToken, selectUser } from '../store/userSlice';
import api from '../api';


const MainNavbar = () => {
  const {theme, changeTheme} = useContext(ThemeContext);
  const [themeButton, setThemeButton] = useState("Világos");
  const [kerelmekCount, setKerelmekCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.role == "felhasznalo") return;
    handleUpdate();
    const interval = setInterval(handleUpdate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (!token || !user.id) return;
    api.request({
      method: 'GET',
      url: `/requests/toapprove`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log(response.data);
      setKerelmekCount(response.data);
      setLoading(false);
    }).catch((error) => {
      console.log(error);
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

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log("logging out");
    await api.post('/logout', {}, { withCredentials: true });
    dispatch(logoutUser())
    navigate('/login');
  }

  return (
    <>
      <Navbar bg={theme} variant={theme} expand="md">
        <Container>
          <Navbar.Brand>Szabadság nyilvántartó</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              {(token && user.id) ? (
                <LinkContainer to="/">
                  <Nav.Link>Főoldal</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {(token && user.id) ? (
                <LinkContainer to="/messages">
                  <Nav.Link>Üzenetek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {(token && user.id) ? (
                <LinkContainer to="/userrequests">
                  <Nav.Link>Saját kérelmek</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {user?.role != "felhasznalo" ? (
                <LinkContainer to="/requests">
                  <Nav.Link>Kérelmek {(kerelmekCount != 0 && !loading) ? `(${kerelmekCount})` : ""}</Nav.Link>
                </LinkContainer>
              ) : (<></>)}
              {user?.role != "felhasznalo" ? (
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
              {(token && user.id) ? (
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