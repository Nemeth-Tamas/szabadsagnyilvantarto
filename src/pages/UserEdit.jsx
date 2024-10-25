import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, Card, Form, Spinner, Table, ToastContainer } from 'react-bootstrap';
import axios from 'axios';
import { BetterErrorToast, ErrorCodes, SuccessToast } from '../components';
import { functions } from '../appwrite';

const UserEdit = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser)
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
  const [coadingEmail, setLoadingEmail] = useState(false);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
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

    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GETUSERBYID, JSON.stringify({
      submittingId: user.$id,
      userId: userID
    })).then((response) => {

      let data = JSON.parse(response.responseBody);
      if (data.status == 'fail') setError(true);
      if (devmode)
        console.log(data);

      setName(data.user.name);
      setUsername(data.user.email);
      setManager(data.user.prefs.manager);
      setPerms(data.user.prefs.perms);
      setRole(data.user.prefs.role);
      setRemainingDays(data.user.prefs.remainingdays);
      setMaxDays(data.user.prefs.maxdays);
      setSick(data.user.prefs.sick);

      functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GETTAPPENZ, JSON.stringify({
        submittingId: user.$id,
        userId: userID
      }))
      .then((response2) => {
        let data = JSON.parse(response2.responseBody);
        if (devmode)
          console.log(data);
        if (data.status == 'fail') setError(true);
        let tableData = [];
        data.tappenz.forEach((item) => {
          tableData.push([item.startDate.split('T')[0], item.endDate != null ? item.endDate.split('T')[0] : '-', item.$id]);
        });
        setSickTableData(tableData);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
    }).catch((error) => {
      console.log(error);
      setError(true);
    });

    // axios.request({
    //   method: 'GET',
    //   url: `${url}/users/${userID}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setName(response.data.user.name);
    //   setUsername(response.data.user.email);
    //   setManager(response.data.user.prefs.manager);
    //   setPerms(response.data.user.prefs.perms);
    //   setRole(response.data.user.prefs.role);
    //   setRemainingDays(response.data.user.prefs.remainingdays);
    //   setMaxDays(response.data.user.prefs.maxdays);
    //   setSick(response.data.user.prefs.sick);

    //   // axios.request({
    //   //   method: 'GET',
    //   //   url: `${url}/tappenz/${userID}`,
    //   //   headers: {
    //   //     'Content-Type': 'application/json',
    //   //     'submittingId': user.$id
    //   //   }
    //   // }).then((response2) => {
    //   //   if (response.status != 200) setError(true);
    //   //   if (response.data.status == 'fail') setError(true);

    //   //   let data = response2.data.tappenz
    //   //   let tableData = [];
    //   //   data.forEach((item) => {
    //   //     tableData.push([item.startDate.split('T')[0], item.endDate != null ? item.endDate.split('T')[0] : '-', item.$id]);
    //   //   })
    //   //   setSickTableData(tableData);

    //   //   setLoading(false);
    //   // }).catch((error) => {
    //   //   console.log(error);
    //   //   setError(true);
    //   // });
      
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
  }, []);

  const updateName = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/name`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     name: name
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERENAME, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      newUserName: name
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingName(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateManager = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/manager`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     manager: manager
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });

    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERPREFS, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      manager: manager
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingManager(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updatePerms = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/perms`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     perms: perms
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERPREFS, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      perms: perms
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingPerms(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateRole = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/role`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     role: role
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERPREFS, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      role: role
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingRole(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateRemainingDays = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/remainingdays`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     remainingdays: remainingDays
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERPREFS, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      remainingdays: remainingDays
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingRemainingDays(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }
  const updateMaxDays = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/maxdays`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     maxdays: maxDays
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSERPREFS, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      maxdays: maxDays
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingMaxDays(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateUsername = (e) => {
    e.preventDefault();

    // axios.request({
    //   method: 'PATCH',
    //   url: `${url}/users/${userID}/email`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     email: username
    //   }
    // }).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (devmode)
    //     console.log(response);

    //   setSuccess(true);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });

    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_EDITUSEREMAIL, JSON.stringify({
      submittingId: user.$id,
      userId: userID,
      newUserEmail: username
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setLoadingEmail(false);
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const updateSickStart = (e) => {
    e.preventDefault();

    if (devmode)
      console.log(sick);
    // axios.request({
    //   method: 'POST',
    //   url: `${url}/tappenz/start`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     userId: userID,
    //     start: sickDate
    //   }
    // }).then((response) => {
    //   console.log(response);
    //   if (response.status != 200) {setError(true); return};
    //   if (response.data.status == 'fail') {setError(true); return};

    //   setSuccess(true);
    //   navigate(0);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_TAPPENZ_START, JSON.stringify({
      userId: userID,
      start: sickDate,
      submittingId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setSuccess(true);
      setLoadingButton(false);
      navigate(0);
    })
    .catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const updateSickEnd = (e) => {
    e.preventDefault();
    // axios.request({
    //   method: 'POST',
    //   url: `${url}/tappenz/end`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     userId: userID,
    //     end: sickDate
    //   }
    // }).then((response) => {
    //   console.log(response);
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);

    //   setSuccess(true);
    //   navigate(0);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_TAPPENZ_END, JSON.stringify({
      userId: userID,
      end: sickDate,
      submittingId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      if (devmode)
        console.log(data);
      if (data.status == 'fail') setError(true);
      setSuccess(true);
      setLoadingButton(false);
      navigate(0);
    })
    .catch((error) => {
      console.log(error);
      setError(true);
    });
  }

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
                              // axios.request({
                              //   method: 'DELETE',
                              //   url: `${url}/tappenz/${item[2]}`,
                              //   headers: {
                              //     'Content-Type': 'application/json',
                              //     'submittingId': user.$id
                              //   }
                              // }).then((response) => {
                              //   if (devmode)
                              //     console.log(response);
                              //   if (response.status != 200) setError(true);
                              //   if (response.data.status == 'fail') setError(true);

                              //   setSuccess(true);
                              //   navigate(0);
                              // }).catch((error) => {
                              //   console.log(error);
                              //   setError(true);
                              // });
                              functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_TAPPENZ_DELETE, JSON.stringify({
                                submittingId: user.$id,
                                deleteId: item[2]
                              }))
                              .then((response) => {
                                let data = JSON.parse(response.responseBody);
                                if (devmode)
                                  console.log(data);
                                if (data.status == 'fail') setError(true);
                                setSuccess(true);
                                setLoadingButton2(false);
                                navigate(0);
                              })
                              .catch((error) => {
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
                  {/* <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                    <Form.Check type="checkbox" label="Táppénz" checked={sick} onChange={(e) => setSick(e.target.checked)} />
                    <Button variant="success" onClick={updateSick} className='ms-1'>Mentés</Button>
                  </div> */}
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
                {/* <Form.Group className="mb-3">
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
                </Form.Group> */}
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