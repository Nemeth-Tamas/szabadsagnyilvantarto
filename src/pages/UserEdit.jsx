import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, Card, Form, ToastContainer } from 'react-bootstrap';
import axios from 'axios';
import { BetterErrorToast, ErrorCodes, SuccessToast } from '../components';

const UserEdit = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const search = useLocation().search;
  const userID = new URLSearchParams(search).get('userid');

  // User data
  const [sick, setSick] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [manager, setManager] = useState('');
  const [perms, setPerms] = useState([]);
  const [role, setRole] = useState('');
  const [remainingDays, setRemainingDays] = useState(0);
  const [maxDays, setMaxDays] = useState(0);

  // All possible perms
  const permsList = [
    'felhasznalo.request',
    'felhasznalo.delete_request',
    'irodavezeto.approve',
    'irpdavezeto.reject',
    'irodavezeto.message_send',
    'irodavezeto.list_own',
    'jegyzo.edit_user',
    'jegyzo.create_user',
    'jegyzo.delete_user',
    'jegyzo.list_all',
    'hr.edit_user_perms',
    'hr.edit_user_current_state'
  ];

  const roles = [
    'felhasznalo',
    'irodavezeto',
    'jegyzo',
    'admin'
  ]

  useEffect(() => {
    if (!user?.prefs?.perms?.includes('hr.edit_user_perms')) {
      navigate('/');
    }

    axios.request({
      method: 'GET',
      url: `${url}/users/${userID}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setName(response.data.user.name);
      setUsername(response.data.user.email);
      setManager(response.data.user.prefs.manager);
      setPerms(response.data.user.prefs.perms);
      setRole(response.data.user.prefs.role);
      setRemainingDays(response.data.user.prefs.remainingdays);
      setMaxDays(response.data.user.prefs.maxdays);
      setSick(response.data.user.prefs.sick);

      setLoading(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }, []);

  const updateName = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/name`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        name: name
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateManager = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/manager`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        manager: manager
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updatePerms = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/perms`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        perms: perms
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateRole = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/role`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        role: role
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateRemainingDays = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/remainingdays`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        remainingdays: remainingDays
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateMaxDays = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/maxdays`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        maxdays: maxDays
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateUsername = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/email`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        email: username
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const updateSick = (e) => {
    e.preventDefault();

    axios.request({
      method: 'PATCH',
      url: `${url}/users/${userID}/sick`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        sick: sick
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);

      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.FailedToLoadUser} />
        <SuccessToast success={success} setSuccess={setSuccess} title="Mentve" text={`Adat sikeresen mentve.`} />
      </ToastContainer>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className='mt-2 pb-2'>
        <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "shadow-light" : "shadow-dark"}>
          {loading && (
            <Card.Body>
              <Card.Title>Betöltés...</Card.Title>
            </Card.Body>
          )}
          {!loading && (
            <Card.Body>
              <Card.Title>Felhasználó azonosító: {userID}</Card.Title>
              <Form>
                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Label>Táppénz</Form.Label>
                  <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                    <Form.Check type="checkbox" label="Táppénz" checked={sick} onChange={(e) => setSick(e.target.checked)} />
                    <Button variant="success" onClick={updateSick} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Label>Név</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="text" placeholder="Név" value={name} style={{ maxWidth: '20rem' }} onChange={(e) => setName(e.target.value)} />
                    <Button variant="success" onClick={updateName} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email cím</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="email" placeholder="Felhasználónév" value={username} style={{ maxWidth: '20rem' }} onChange={(e) => setUsername(e.target.value)} />
                    <Button variant="success" onClick={updateUsername} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Manager</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="text" placeholder="Felettes azonosítója" value={manager} style={{ maxWidth: '20rem' }} onChange={(e) => setManager(e.target.value)} />
                    <Button variant="success" onClick={updateManager} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Jogosultságok</Form.Label>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {permsList.map((perm, index) => (
                      <Form.Check key={index} type="checkbox" label={perm} checked={perms.includes(perm)} onChange={(e) => {
                        if (perms.includes(perm)) {
                          setPerms(perms.filter((p) => p != perm));
                        } else {
                          setPerms([...perms, perm]);
                        }
                      }} />
                    ))}
                    <Button variant="success" onClick={updatePerms} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Szerepkör</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Select value={role} style={{ maxWidth: '20rem' }} onChange={(e) => setRole(e.target.value)}>
                      {roles.map((role, index) => (
                        <option key={index} value={role}>{role}</option>
                      ))}
                    </Form.Select>
                    <Button variant="success" onClick={updateRole} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hátralévő napok</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="number" placeholder="Hátralévő napok" value={remainingDays} style={{ maxWidth: '20rem' }} onChange={(e) => setRemainingDays(e.target.value)} />
                    <Button variant="success" onClick={updateRemainingDays} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Maximális napok</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="number" placeholder="Maximális napok" value={maxDays} style={{ maxWidth: '20rem' }} onChange={(e) => setMaxDays(e.target.value)} />
                    <Button variant="success" onClick={updateMaxDays} className='ms-1'>Mentés</Button>
                  </div>
                </Form.Group>
              </Form>

              <Button variant="danger" onClick={() => navigate('/users')}>Vissza</Button>
            </Card.Body>
          )}
        </Card>
      </div>
    </>
  )
}

export default UserEdit