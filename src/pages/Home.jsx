import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, ButtonGroup, Card, Col, Container, FormSelect, Modal, Row, Spinner, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectToken, selectUser, setUser } from '../store/userSlice';
import { CustomCalendar, CustomCalendarDisplayOnly, RemainingIndicator, SuccessToast, BetterErrorToast, ErrorCodes, PasswordField } from '../components';
import api from '../api';

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.RequestNotSent);
  const [loadingSendButton, setLoadingSendButton] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedType, setSelectedType] = useState('SZ');
  const [takenDays, setTakenDays] = useState(new Map());
  const [currentlyOnLeave, setCurrentlyOnLeave] = useState(false);
  const [sick, setSick] = useState(null);
  const [submittingId, setSubmittingId] = useState(user?.id);
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
    api.request({
      method: 'GET',
      url: `/users`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        if (response.status == 200) {
          setData(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }

    if (user.id) {
      getUserSick();
      getUserDays();
      getUserPlanFilled();
      if (user.role == 'admin') {
        handleUpdate();
      }
    }
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectedDates);
    console.log(data);
    
    let options = {
      method: 'POST',
      url: `/requests`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        managerId: data.find((user) => user.id == submittingId)?.managerId,
        type: selectedType,
        dates: selectedDates
      }
    }

    if (options.data.managerId == undefined) {
      options.data.managerId = user?.managerId;
    }

    if (selectedDates.length == 0) return;
    if (user?.remainingDays - selectedDates.length < 0) {
      if (selectedType == 'SZ') {
        setErrorCode(ErrorCodes.NotEnoughLeaves);
        setError(true);
        return;
      }
    }

    let doNotProceed = false;
    takenDays.forEach((type, date) => {
      if (selectedDates.includes(date)) {
        setErrorCode(ErrorCodes.AlreadyOnLeave);
        setError(true);
        doNotProceed = true;
        return;
      }
    })

    if (doNotProceed) return;
    setErrorCode(ErrorCodes.RequestNotSent);
    api.request(options)
      .then((response) => {
        console.log("HERE:", response);
        if (response.status != 200) setError(true);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
    setSelectedDates([]);
    setLoadingSendButton(false);
    setSuccess(true);
  }

  const handleRadioChange = (e) => {
    setSelectedType(e.target.id);
  }

  const getUserPlanFilled = () => {
    let options = {
      method: 'GET',
      url: `/plans/${user.id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    setErrorCode(ErrorCodes.ServerError);
    api.request(options)
      .then((response) => {
        console.log(response);
        if (response.status == 200) {
          setPlanFilledOut(response.data.filledOut);
          console.log(response.data.filledOut);
        }
      }).catch((error) => {
        console.log(error);
        setError(true);
      });
  }

  const getUserDays = () => {
    let takenDaysCurrent = new Map();
    let options = {
      method: 'GET',
      url: `/leaves/own`,
      headers: {
        'Content-Type': 'application/json',
      }
    }
    setErrorCode(ErrorCodes.ServerError);
    api.request(options)
      .then((response) => {
        console.log(response);
        if (response.status != 200) setError(true);
        if (response.status == 500) {
          setErrorCode(ErrorCodes.ServerError);
          setError(true);
          return;
        }
        response.data.forEach((document) => {
          document.dates.forEach((date) => {
            takenDaysCurrent.set(date.split("T")[0], document.type)
          });
        });
        
        setTakenDays(takenDaysCurrent);

        // TODO: this needs further testing
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
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });

  }

  const getUserSick = () => {
    let options = {
      method: 'GET',
      url: `/tappenz/current/${user.id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    api.request(options).then((response) => {
      if (response.status != 200) setError(true);
      setSick(response.data.current);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const handleOnUserSelect = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    setSubmittingId(e.target.value);
  }

  // const handleSubmitPassword = (e) => {
  //   e.preventDefault();
  //   setOldPassword(oldPassword.trim());
  //   setNewPasswordOne(newPasswordOne.trim());
  //   setNewPasswordTwo(newPasswordTwo.trim());

  //   if (newPasswordOne != newPasswordTwo) {
  //     setErrorCode(ErrorCodes.PasswordsDontMatch);
  //     setError(true);
  //     return;
  //   }
    
  //   if (oldPassword == newPasswordOne) {
  //     setErrorCode(ErrorCodes.PasswordsNotMatch);
  //     setError(true);
  //     return;
  //   }

  //   if (oldPassword == '' || newPasswordOne == '' || newPasswordTwo == '') {
  //     setErrorCode(ErrorCodes.EmptyField);
  //     setError(true);
  //     return;
  //   }

  //   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  //   // const passwordRegex = /^(?=.*[a-z]).{8,}$/;

  //   if (passwordRegex.test(newPasswordOne) == false) {
  //     setErrorCode(ErrorCodes.NewPasswordDoesNotMatchPattern);
  //     setError(true);
  //     return;
  //   }

  //   if (import.meta.env.VITE_PASSWORD_CHANGE_ENABLED == 'true') {
  //     updatePassword(oldPassword, newPasswordOne)
  //     .then((response) => {
  //       if (response == true) {
  //         dispatch(logoutUser())
  //         navigate('/login');
  //       }
  //     })
  //     .catch((error) => {
  //       if (error.message.includes('Invalid credentials')) {
  //         setErrorCode(ErrorCodes.OldPasswordWrong);
  //         setError(true);
  //         return;
  //       }
  //       setErrorCode(ErrorCodes.PasswordChangeFailedPleaseContactAdmin);
  //       setError(true);
  //     });
  //   }
  // }

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
            {/* <Button variant="success" onClick={handleSubmitPassword}>
              Mentés
            </Button> */}
          </div>
        </Modal.Footer>
      </Modal>
      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
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
              <Card.Body className='d-flex flex-column align-items-center'>
                <Card.Title><h1 className='display-5 text-center'>{user?.name}</h1></Card.Title>
                <Card.Text className='text-sm-center'>
                  Rendelkezésre álló szabadságok száma / Összes szabadság száma
                </Card.Text>
                <RemainingIndicator maxDays={user?.maxDays} remainingDays={user?.remainingDays} />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Szabadság kérelem küldése</h1></Card.Title>
                <CustomCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
                { (data != [] && user?.role == "admin") &&
                  // <p>{JSON.stringify(data)}</p>
                  <FormSelect value={submittingId} onChange={handleOnUserSelect} className='mt-3'>
                    <option value={user?.id}>Saját</option>
                    {data.map((guser) => {
                      if(guser.id != user.id) 
                        return <option key={guser.id} value={guser.id}>{guser.name}</option>
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
                  {user?.role == 'admin' && (
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
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Naptár</h1></Card.Title>
                <CustomCalendarDisplayOnly selectedDates={takenDays} />

                <Badge bg='secondary' className='p-2 mt-3 m-2'>Szabadság</Badge>
                <Badge bg='dark' className='p-2 m-2 border'>Hozzátartozó halála</Badge>
                <Badge bg='info' text='dark' className='p-2 m-2'>Apa szabadság</Badge>
                <Badge bg='warning' text='dark' className='p-2 m-2'>Szülési szabadság</Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-4 shadow-light" : "mt-4 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Statisztika</h1></Card.Title>
                <Card.Text>
                  Megállapított szabadságok száma: {user?.maxDays}
                </Card.Text>
                <Card.Text>
                  Igénybevett szabadságok száma: {user?.maxDays - user?.remainingDays}
                </Card.Text>
                <Card.Text>
                  Rendelkezésreálló szabadságok száma: {user?.remainingDays}
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