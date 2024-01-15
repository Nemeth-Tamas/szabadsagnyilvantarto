import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, ButtonGroup, Card, Col, Container, FormSelect, Row, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../store/userSlice';
import { CustomCalendar, CustomCalendarDisplayOnly, RemainingIndicator, SuccessToast, BetterErrorToast, ErrorCodes } from '../components';
import axios from 'axios';
import { getUserData } from '../appwrite';

const Home = () => {
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.RequestNotSent);
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedType, setSelectedType] = useState('SZ');
  const dispatch = useDispatch();
  const [takenDays, setTakenDays] = useState(new Map());
  const [currentlyOnLeave, setCurrentlyOnLeave] = useState(false);
  const [submittingId, setSubmittingId] = useState(user?.$id);
  const [planFilledOut, setPlanFilledOut] = useState(true);

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

      getUserDays();
      getUserPlanFilled();
      handleUpdate();
    }
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectedDates);
    let options = {
      method: 'POST',
      url: `${url}/kerelmek/add`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': submittingId
      },
      data: {
        // managerId: user?.prefs?.manager,
        managerId: data.find((user) => user.$id == submittingId)?.prefs?.manager,
        type: selectedType,
        dates: selectedDates
      }
    }

    if (selectedDates.length == 0) return;
    if (user?.prefs?.remainingdays - selectedDates.length < 0) {
      if (selectedType == 'SZ') {
        setErrorCode(ErrorCodes.NotEnoughLeaves);
        setError(true);
        return;
      }
    }

    let doNotProceed = false;

    takenDays.forEach((type, date) => {
      console.log(date, type);
      if (selectedDates.includes(date)) {
        setErrorCode(ErrorCodes.AlreadyOnLeave);
        setError(true);
        doNotProceed = true;
        return;
      }
    })

    setErrorCode(ErrorCodes.RequestNotSent);
    if (doNotProceed) return;
    axios.request(options)
      .then((response) => {
        console.log("HERE:", response);
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        if (response.data.status == 'success') setSuccess(true);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
    setSelectedDates([]);
  }

  const handleRadioChange = (e) => {
    setSelectedType(e.target.id);
  }

  const getUserPlanFilled = () => {
    let options = {
      method: 'GET',
      url: `${url}/plans/${submittingId}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }

    setErrorCode(ErrorCodes.ServerError);
    axios.request(options)
      .then((response) => {
        console.log(response);
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        if (response.data.status == 'success') {
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
      url: `${url}/szabadsagok/own`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }

    setErrorCode(ErrorCodes.ServerError);
    axios.request(options)
      .then((response) => {
        console.log(response);
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        if (response.data.status == 'success') {
          response.data.szabadsagok.documents.forEach((document) => {
            document.dates.forEach((date) => {
              takenDaysCurrent.set(date, document.type)
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
          if (takenDaysCurrent.has(todayString) || user.prefs.sick) {
            setCurrentlyOnLeave(true);
          } else {
            setCurrentlyOnLeave(false);
          }
        }
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

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={errorCode} />
        <SuccessToast success={success} setSuccess={setSuccess} title='Elküldve' text='Kérelmét sikeresen elküldtük.' />
      </ToastContainer>
      <Container className='h-100 d-flex flex-column'>
        {currentlyOnLeave && <Row className='flex-grow-1'>
          <Col className='col-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body className='d-flex flex-column align-items-center'>
                {user?.prefs?.sick == true
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
                <RemainingIndicator maxDays={user?.prefs?.maxdays} remainingDays={user?.prefs?.remainingdays} />
                <Button variant='info' onClick={(e) => handleDownloadTEMP(e)}>Download TEMP</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Szabadság kérelem küldése</h1></Card.Title>
                <CustomCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
                { data != [] &&
                  // <p>{JSON.stringify(data)}</p>
                  <FormSelect value={submittingId} onChange={handleOnUserSelect}>
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
                </ButtonGroup>
                <button type="button" className='btn btn-success mt-3 shadow-smc' onClick={handleSubmit}>Küldés</button>
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
                <Badge bg='danger' className='p-2 m-2'>Táppénz</Badge>
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
                  Megállapított szabadságok száma: {user?.prefs?.maxdays}
                </Card.Text>
                <Card.Text>
                  Igénybevett szabadságok száma: {user?.prefs?.maxdays - user?.prefs?.remainingdays}
                </Card.Text>
                <Card.Text>
                  Rendelkezésreálló szabadságok száma: {user?.prefs?.remainingdays}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Home