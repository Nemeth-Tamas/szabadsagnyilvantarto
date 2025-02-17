import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../store/userSlice';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, Card, Form, Spinner, Table, ToastContainer } from 'react-bootstrap';
import { BetterErrorToast, ErrorCodes, SuccessToast } from '../components';
import api from '../api';

const UserEdit = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const devmode = import.meta.env.VITE_DEVMODE;
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [loadingButton2, setLoadingButton2] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingManager, setLoadingManager] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingRemainingDays, setLoadingRemainingDays] = useState(false);
  const [loadingMaxDays, setLoadingMaxDays] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const search = useLocation().search;
  const userID = new URLSearchParams(search).get('userid');
  const [sickTableData, setSickTableData] = useState([]); // [start, end, id]

  // User data
  const [sick, setSick] = useState(false);
  const [sickDate, setSickDate] = useState(new Date().toISOString().split("T")[0]); // start or end
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [manager, setManager] = useState('');
  const [perms, setPerms] = useState([]);
  const [role, setRole] = useState('');
  const [remainingDays, setRemainingDays] = useState(0);
  const [maxDays, setMaxDays] = useState(0);

  const roles = [
    'felhasznalo',
    'irodavezeto',
    'jegyzo',
    'admin'
  ]

  useEffect(() => {
    if (!token || !user.role == 'admin') {
      navigate('/login');
    }

    api.request({
      method: 'GET',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setName(response.data.name);
      setUsername(response.data.email);
      setManager(response.data.managerId);
      setRole(response.data.role);
      setRemainingDays(response.data.remainingDays);
      setMaxDays(response.data.maxDays);
      setSick(response.data.sick);

      api.request({
        method: 'GET',
        url: `/tappenz/${userID}`,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((response2) => {
        if (response.status != 200) setError(true);
        if (devmode) console.log("RESPONSE2:", response2);

        let data = response2.data;
        let tableData = [];
        data.forEach((item) => {
          tableData.push([item.startDate.split('T')[0], item.endDate != null ? item.endDate.split('T')[0] : '-', item.id]);
        })
        setSickTableData(tableData);

        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setError(true);
      });
      
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }, []);

  const updateName = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        name: name
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingName(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateManager = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        managerId: manager
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingManager(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateRole = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        role: role
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingRole(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateRemainingDays = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        remainingDays: remainingDays
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingRemainingDays(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateMaxDays = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        maxDays: maxDays
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingMaxDays(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateUsername = (e) => {
    e.preventDefault();

    api.request({
      method: 'PATCH',
      url: `/user/${userID}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: username
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (devmode)
        console.log(response);

      setSuccess(true);
      setLoadingEmail(false);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const updateSickStart = (e) => {
    e.preventDefault();

    if (devmode)
      console.log(sick);
    api.request({
      method: 'POST',
      url: `/tappenz/start`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: userID,
        start: sickDate
      }
    }).then((response) => {
      console.log(response);
      if (response.status != 200) {setError(true); return};

      setSuccess(true);
      setLoadingButton(false);
      navigate(0);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateSickEnd = (e) => {
    e.preventDefault();
    api.request({
      method: 'POST',
      url: `/tappenz/end`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: userID,
        end: sickDate
      }
    }).then((response) => {
      console.log(response);
      if (response.status != 200) setError(true);

      setSuccess(true);
      setLoadingButton(false);
      navigate(0);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  return (
    <>
      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
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
                  <Form.Label>Táppénz {sick ? "vége" : "kezdete"}</Form.Label>
                  <br />
                  <Form.Label className='text-danger'>Kezdődátum a legutóbbi bejegyzett táppénz elé nem írható be!</Form.Label>
                  <div style={{ display: 'flex' }}>
                    {!sick && (
                      <>
                        <Form.Control type="date" placeholder="Táppénz kezdete" value={sickDate} onChange={(e) => setSickDate(e.target.value)}  />
                        {loadingButton && (
                          <Button variant="success" disabled>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            Mentés...
                          </Button>
                        )}
                        {!loadingButton && (
                          <Button variant="success" onClick={(e) => {
                            e.preventDefault();
                            setLoadingButton(true);
                            updateSickStart(e);
                          }} className='ms-1'>Mentés</Button>
                        )}
                      </>
                    )}
                    {sick && (
                      <>
                        <Form.Control type="date" placeholder="Táppénz vége" value={sickDate} onChange={(e) => setSickDate(e.target.value)} />
                        {loadingButton && (
                          <Button variant="success" disabled>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            Mentés...
                          </Button>
                        )}
                        {!loadingButton && (
                          <Button variant="success" onClick={(e) => {
                            e.preventDefault();
                            setLoadingButton(true);
                            updateSickEnd(e);
                          }} className='ms-1'>Mentés</Button>
                        )}
                      </>
                    )}
                  </div>
                  <Form.Label>Táppénz előzmények</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Table striped bordered hover variant={theme} className='mt-2'>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Kezdete</th>
                          <th>Vége</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sickTableData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item[0]}</td>
                            <td>{item[1]}</td>
                            <td><Button variant="danger" onClick={(e) => {
                              e.preventDefault();
                              setLoadingButton2(true);
                              api.request({
                                method: 'DELETE',
                                url: `/tappenz/${item[2]}`,
                                headers: {
                                  'Content-Type': 'application/json',
                                }
                              }).then((response) => {
                                if (devmode)
                                  console.log(response);
                                if (response.status != 200) setError(true);

                                setSuccess(true);
                                setLoadingButton2(false);
                                navigate(0);
                              }).catch((error) => {
                                console.log(error);
                                setError(true);
                              });
                            }}>
                              {loadingButton2 ? (
                                <>
                                  <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />Törlés...
                                </>
                              ) : 'Törlés'}
                            </Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Label>Név</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="text" placeholder="Név" value={name} onChange={(e) => setName(e.target.value)} />
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingName(true);
                      updateName(e);
                    }} className='ms-1'>
                      {loadingName && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés
                    </Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email cím</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="email" placeholder="Felhasználónév" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingEmail(true);
                      updateUsername(e);
                    }} className='ms-1'>
                      {loadingEmail && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Manager</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="text" placeholder="Felettes azonosítója" value={manager} onChange={(e) => setManager(e.target.value)} />
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingManager(true);
                      updateManager(e);
                    }} className='ms-1'>
                      {loadingManager && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Szerepkör</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                      {roles.map((role, index) => (
                        <option key={index} value={role}>{role}</option>
                      ))}
                    </Form.Select>
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingRole(true);
                      updateRole(e);
                    }} className='ms-1'>
                      {loadingRole && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hátralévő napok</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="number" placeholder="Hátralévő napok" value={remainingDays} onChange={(e) => setRemainingDays(e.target.value)} />
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingRemainingDays(true);
                      updateRemainingDays(e);
                    }} className='ms-1'>
                      {loadingRemainingDays && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés</Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Maximális napok</Form.Label>
                  <div style={{ display: 'flex' }}>
                    <Form.Control type="number" placeholder="Maximális napok" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} />
                    <Button variant="success" onClick={(e) => {
                      e.preventDefault();
                      setLoadingMaxDays(true);
                      updateMaxDays(e);
                    }} className='ms-1'>
                      {loadingMaxDays && (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      )}
                      Mentés</Button>
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