import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, ButtonGroup, Card, Col, Container, FormSelect, Modal, Row, Spinner, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser, setUser } from '../store/userSlice';
import { CustomCalendar, CustomCalendarDisplayOnly, RemainingIndicator, SuccessToast, BetterErrorToast, ErrorCodes, PasswordField, LoadingCircle } from '../components';
import axios from 'axios';
import { functions, getUserData, updatePassword } from '../appwrite';

const Home = () => {
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.RequestNotSent);
  const [loading, setLoading] = useState(true);
  const [loadingSendButton, setLoadingSendButton] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedType, setSelectedType] = useState('SZ');
  const dispatch = useDispatch();
  const [takenDays, setTakenDays] = useState(new Map());
  const [currentlyOnLeave, setCurrentlyOnLeave] = useState(false);
  const [sick, setSick] = useState(null);
  const [submittingId, setSubmittingId] = useState(user?.$id);
  const [planFilledOut, setPlanFilledOut] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordOne, setNewPasswordOne] = useState('');
  const [newPasswordTwo, setNewPasswordTwo] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePasswordClose = () => {
    setShowChangePassword(false);
    setOldPassword('');
    setNewPasswordOne('');
    setNewPasswordTwo('');
  }

  const handleUpdate = () => {
    setErrorCode(ErrorCodes.FailedToLoadUsers);
    axios.request({
      method: 'GET',
      url: `${url}/users`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        console.log(response);
        setData(response.data.usersList.users);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  useEffect(() => {
    console.log(user);

    if (!user || !user.$id) {
      navigate('/login');
    }

    if (user?.$id) {
      getUserData()
        .then(acc => {
          dispatch(setUser(acc));
        })
        .catch(error => {
          console.log(error);
        });

      getUserSick();
      getUserDays();
      getUserPlanFilled();
      if (user?.prefs?.perms?.includes("hr.edit_user_current_state")) {
        handleUpdate();
      }
    }
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectedDates);

    if (selectedDates.length == 0) return;
    if (user?.prefs?.remainingdays - selectedDates.length < 0) {
      if (selectedType == 'SZ') {
        setErrorCode(ErrorCodes.NotEnoughLeaves);
        setError(true);
        setLoadingSendButton(false);
        return;
      }
    }

    let doNotProceed = false;
    takenDays.forEach((type, date) => {
      if (selectedDates.includes(date)) {
        setErrorCode(ErrorCodes.AlreadyOnLeave);
        setError(true);
        doNotProceed = true;
        setLoadingSendButton(false);
        return;
      }
    });

    if (doNotProceed) return;

    setErrorCode(ErrorCodes.RequestNotSent);
    // axios.request(options)
    //   .then((response) => {
    //     console.log("HERE:", response);
    //     if (response.status != 200) setError(true);
    //     if (response.data.status == 'fail') setError(true);
    //     if (response.data.status == 'success') setSuccess(true);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setError(true);
    //   });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_ADD_KERELEM, JSON.stringify({
      submittingId: submittingId,
      managerId: data.find((user) => user.$id == submittingId)?.prefs?.manager || user?.prefs?.manager,
      type: selectedType,
      dates: selectedDates
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setSuccess(true);
      setLoadingSendButton(false);
    })
    .catch((error) => {
      console.log(error);
      setLoadingSendButton(false);
      setError(true);
    });
    // let options = {
    //   method: 'POST',
    //   url: `${url}/kerelmek/add`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': submittingId
    //   },
    //   data: {
    //     // managerId: user?.prefs?.manager,
    //     managerId: data.find((user) => user.$id == submittingId)?.prefs?.manager,
    //     type: selectedType,
    //     dates: selectedDates
    //   }
    // }

    // if (options.data.managerId == undefined) {
    //   options.data.managerId = user?.prefs?.manager;
    // }
    setSelectedDates([]);
  }

  const handleRadioChange = (e) => {
    setSelectedType(e.target.id);
  }

  const getUserPlanFilled = () => {
    // let options = {
    //   method: 'GET',
    //   url: `${url}/plans/${submittingId}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // }

    setErrorCode(ErrorCodes.ServerError);
    // axios.request(options)
    //   .then((response) => {
    //     console.log(response);
    //     if (response.status != 200) setError(true);
    //     if (response.data.status == 'fail') setError(true);
    //     if (response.data.status == 'success') {
    //       setPlanFilledOut(response.data.filledOut);
    //       console.log(response.data.filledOut);
    //     }
    //   }).catch((error) => {
    //     console.log(error);
    //     setError(true);
    //   });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GET_PLANS, JSON.stringify({
      submittingId: submittingId,
      userId: submittingId
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setPlanFilledOut(data.filledOut);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const getUserDays = () => {
    let takenDaysCurrent = new Map();
    // let options = {
    //   method: 'GET',
    //   url: `${url}/szabadsagok/own`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // }

    // axios.request(options)
    //   .then((response) => {
    //     console.log(response);
    //     if (response.status != 200) setError(true);
    //     if (response.data.status == 'fail') setError(true);
    //     if (response.data.status == 'success') {
    //       response.data.szabadsagok.documents.forEach((document) => {
    //         document.dates.forEach((date) => {
    //           takenDaysCurrent.set(date, document.type)
    //         });
    //       });
    //       setTakenDays(takenDaysCurrent);

    //       // TODO: this needs further testing
    //       let today = new Date();
    //       if (today.getMonth() < 10) {
    //         today.setMonth(today.getMonth());
    //         today = new Date(today.getTime() - 1);
    //       }
    //       if (today.getDate() < 10) {
    //         today.setDate(today.getDate() + 1);
    //         today = new Date(today.getTime() - 1);
    //       }
          
    //       let todayString = today.toISOString().split('T')[0];
    //       if (takenDaysCurrent.has(todayString)) {
    //         setCurrentlyOnLeave(true);
    //       } else {
    //         setCurrentlyOnLeave(false);
    //       }
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setError(true);
    //   });
    setErrorCode(ErrorCodes.ServerError);
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GETSZABADSAGOK, JSON.stringify({
      submittingId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      data.szabadsagok.documents.forEach((document) => {
        document.dates.forEach((date) => {
          takenDaysCurrent.set(date, document.type)
        });
      });
      setTakenDays(takenDaysCurrent);

      let today = new Date();
      if (today.getMonth() < 10) {
        today.setMonth(today.getMonth());
        today = new Date(today.getTime() - 1);
      }
      if (today.getDate() < 10) {
        today.setDate(today.getDate() + 1);
        today = new Date(today.getTime() - 1);
      }
      
      let todayString = today.toISOString().split('T')[0];
      if (takenDaysCurrent.has(todayString)) {
        setCurrentlyOnLeave(true);
      } else {
        setCurrentlyOnLeave(false);
      }

      setLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const getUserSick = () => {
    // let options = {
    //   method: 'GET',
    //   url: `${url}/tappenz/current/${user.$id}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // }

    // axios.request(options).then((response) => {
    //   if (response.status != 200) setError(true);
    //   if (response.data.status == 'fail') setError(true);
    //   if (response.data.status == 'success') {
    //     console.log("IMPORTANT", response.data.current)
    //     setSick(response.data.current);
    //   }
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    setErrorCode(ErrorCodes.ServerError);
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_TAPPENZ_CURRENT, JSON.stringify({
      submittingId: user.$id,
      userId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setSick(data.current);
    })
    .catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const handleOnUserSelect = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setSubmittingId(e.target.value);
  }

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    setOldPassword(oldPassword.trim());
    setNewPasswordOne(newPasswordOne.trim());
    setNewPasswordTwo(newPasswordTwo.trim());

    if (newPasswordOne != newPasswordTwo) {
      setErrorCode(ErrorCodes.PasswordsDontMatch);
      setError(true);
      return;
    }
    
    if (oldPassword == newPasswordOne) {
      setErrorCode(ErrorCodes.PasswordsNotMatch);
      setError(true);
      return;
    }

    if (oldPassword == '' || newPasswordOne == '' || newPasswordTwo == '') {
      setErrorCode(ErrorCodes.EmptyField);
      setError(true);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    // const passwordRegex = /^(?=.*[a-z]).{8,}$/;

    if (passwordRegex.test(newPasswordOne) == false) {
      setErrorCode(ErrorCodes.NewPasswordDoesNotMatchPattern);
      setError(true);
      return;
    }

    if (import.meta.env.VITE_PASSWORD_CHANGE_ENABLED == 'true') {
      updatePassword(oldPassword, newPasswordOne)
      .then((response) => {
        if (response == true) {
          dispatch(logoutUser())
          navigate('/login');
        }
      })
      .catch((error) => {
        if (error.message.includes('Invalid credentials')) {
          setErrorCode(ErrorCodes.OldPasswordWrong);
          setError(true);
          return;
        }
        setErrorCode(ErrorCodes.PasswordChangeFailedPleaseContactAdmin);
        setError(true);
      });
    }
  }

  return (
    <>
      <Modal variant={theme} show={showChangePassword} onHide={handleChangePasswordClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Jelszó változtazás</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label">Jelenlegi jelszó</label>
              {/* <input type="password" className="form-control" id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /> */}
              <PasswordField id="oldPassword" password={oldPassword} setPassword={setOldPassword} placeholder="Régi jelszó" />
            </div>
            <div className="mb-3">
              <label htmlFor="newPasswordOne" className="form-label">Új jelszó</label>
              {/* <input type="password" className="form-control" id="newPasswordOne" value={newPasswordOne} onChange={(e) => setNewPasswordOne(e.target.value)} /> */}
              <PasswordField id="newPasswordOne" password={newPasswordOne} setPassword={setNewPasswordOne} placeholder="Új jelszó"/>
            </div>
            <div className="mb-3">
              <label htmlFor="newPasswordTwo" className="form-label">Új jelszó mégegyszer</label>
              {/* <input type="password" className="form-control" id="newPasswordTwo" value={newPasswordTwo} onChange={(e) => setNewPasswordTwo(e.target.value)} /> */}
              <PasswordField id="newPasswordTwo" password={newPasswordTwo} setPassword={setNewPasswordTwo} placeholder="Új jelszó mégegyszer"/>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between align-items-center'>
          <p className='text-danger' style={{ fontSize: '0.8rem' }}>Legalább 8 karakter, kis-, nagybetű és szám.</p>
          <div className='d-flex gap-2'>
            <Button variant={theme} onClick={() => handleChangePasswordClose()}>
              Bezárás
            </Button>
            <Button variant="success" onClick={handleSubmitPassword}>
              Mentés
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={errorCode} />
        <SuccessToast success={success} setSuccess={setSuccess} title='Elküldve' text='Kérelmét sikeresen elküldtük.' />
      </ToastContainer>
      <Container className='h-100 d-flex flex-column'>
        {(currentlyOnLeave || sick) && <Row className='flex-grow-1'>
          <Col className='col-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body className='d-flex flex-column align-items-center'>
                {sick == true
                ? <Card.Title><h1 className='display-5 text-center text-danger'>Jelenleg táppénzen</h1></Card.Title>
                : <Card.Title><h1 className='display-5 text-center text-danger'>Jelenleg szabadságon</h1></Card.Title>}
              </Card.Body>
            </Card>
          </Col>
        </Row>}
        {!planFilledOut && <Row className='flex-grow-1'>
          <Col className='col-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body className='d-flex flex-column align-items-center'>
                <Card.Title><h1 className='display-5 text-center text-danger'>Még nincs kitöltve a szabadság terve.</h1></Card.Title>
                <Button variant='success' onClick={(e) => navigate('/plan')}>Kitöltés most!</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>}
        <Row className='flex-grow-1'>
          <Col className='col-lg-5 col-md-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              {loading ? (
                <Card.Body className='d-flex flex-column align-items-center'>
                  <Spinner animation='border' role='status' />
                  <p className='text-center'>Betöltés...</p>
                </Card.Body>
              ) : (
                <Card.Body className='d-flex flex-column align-items-center'>
                  <Card.Title><h1 className='display-5 text-center'>{user?.name}</h1></Card.Title>
                  <Card.Text className='text-sm-center'>
                    Rendelkezésre álló szabadságok száma / Összes szabadság száma
                  </Card.Text>
                  <RemainingIndicator maxDays={user?.prefs?.maxdays} remainingDays={user?.prefs?.remainingdays} />
                </Card.Body>
              )}
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Szabadság kérelem küldése</h1></Card.Title>
                <CustomCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
                { (data != [] && user?.prefs?.perms?.includes("hr.edit_user_current_state")) &&
                  // <p>{JSON.stringify(data)}</p>
                  <FormSelect value={submittingId} onChange={handleOnUserSelect} className='mt-3'>
                    <option value={user?.$id}>Saját</option>
                    {data.map((guser) => {
                      if(guser.$id != user.$id) 
                        return <option key={guser.$id} value={guser.$id}>{guser.name}</option>
                    })}
                  </FormSelect>
                }
                <ButtonGroup role='group' aria-label='Szabadság típusa' className='d-flex justify-content-center mt-3'>
                  <input type="radio" className='btn-check' name='szabadsagTipusa' id='SZ' autoComplete='off' onChange={handleRadioChange} checked={selectedType === 'SZ'} />
                  <label className="btn btn-outline-secondary" htmlFor="SZ">Szabadság</label>
                  <input type="radio" className='btn-check' name='szabadsagTipusa' id='H' autoComplete='off' onChange={handleRadioChange} checked={selectedType === 'H'} />
                  <label className="btn btn-outline-primary" htmlFor="H">Hozzátartozó halála</label>
                  <input type="radio" className='btn-check' name='szabadsagTipusa' id='SZSZ' autoComplete='off' onChange={handleRadioChange} checked={selectedType === 'SZSZ'} />
                  <label className="btn btn-outline-warning" htmlFor="SZSZ">Szülési szabadság</label>
                  {user?.prefs?.perms?.includes('hr.edit_user_current_state') && (
                    <>
                      <input type="radio" className='btn-check' name='szabadsagTipusa' id='A' autoComplete='off' onChange={handleRadioChange} checked={selectedType === 'A'} />
                      <label className="btn btn-outline-info" htmlFor="A">Apa szabadság</label>
                    </>
                  )}
                </ButtonGroup>
                <button type="button" className='btn btn-success mt-3 shadow-smc' onClick={(e) => {
                  e.preventDefault();
                  setLoadingSendButton(true);
                  handleSubmit(e);
                }}>
                  {loadingSendButton && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  Küldés
                </button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='flex-grow-1 mb-5'>
          <Col className='col-lg-7 col-md-12 col-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-4 shadow-light" : "mt-4 shadow-dark"}>
              { loading ? (
                <Card.Body className='d-flex flex-column align-items-center'>
                  <Spinner animation='border' role='status' />
                  <p className='text-center'>Betöltés...</p>
                </Card.Body>
              ) : (
                <Card.Body>
                  <Card.Title><h1 className='display-6 text-center'>Naptár</h1></Card.Title>
                  <CustomCalendarDisplayOnly selectedDates={takenDays} />

                  <Badge bg='secondary' className='p-2 mt-3 m-2'>Szabadság</Badge>
                  <Badge bg='dark' className='p-2 m-2 border'>Hozzátartozó halála</Badge>
                  <Badge bg='info' text='dark' className='p-2 m-2'>Apa szabadság</Badge>
                  <Badge bg='warning' text='dark' className='p-2 m-2'>Szülési szabadság</Badge>
                </Card.Body>
              )}
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-4 shadow-light" : "mt-4 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Statisztika</h1></Card.Title>
                <Card.Text>
                  Megállapított szabadságok száma: {user?.prefs?.maxdays}
                </Card.Text>
                <Card.Text>
                  Igénybevett szabadságok száma: {user?.prefs?.maxdays - user?.prefs?.remainingdays}
                </Card.Text>
                <Card.Text>
                  Rendelkezésreálló szabadságok száma: {user?.prefs?.remainingdays}
                </Card.Text>
                {import.meta.env.VITE_PASSWORD_CHANGE_ENABLED == 'true' && (
                  <Button variant='primary' onClick={(e) => {
                    e.preventDefault();
                    setShowChangePassword(true);
                  }}>Jelszó módosítása</Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home