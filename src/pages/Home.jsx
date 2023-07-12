import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, ButtonGroup, Card, Col, Container, Row, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '../store/userSlice';
import { CustomCalendar, CustomCalendarDisplayOnly, ErrorToast, RemainingIndicator, SuccessToast } from '../components';
import axios from 'axios';
import { getUserData } from '../appwrite';

const Home = () => {
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedType, setSelectedType] = useState('SZ');
  const [notEnoughError, setNotEnoughError] = useState(false);
  const dispatch = useDispatch();
  const [takenDays, setTakenDays] = useState(new Map());
  const [currentlyOnLeave, setCurrentlyOnLeave] = useState(false);

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
        'submittingId': user.$id
      },
      data: {
        managerId: user?.prefs?.manager,
        type: selectedType,
        dates: selectedDates
      }
    }

    console.log(options);

    if (selectedDates.length == 0) return;
    if (user?.prefs?.remainingdays - selectedDates.length < 0) {
      if (selectedType == 'SZ') {
        setNotEnoughError(true);
        return;
      }
    }

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

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <ErrorToast error={error} setError={setError} text='Nem sikerült elküldeni a kérelmét. Kérjük próbálja újra később.' />
        <ErrorToast error={notEnoughError} setError={setNotEnoughError} text='Nem sikerült elküldeni a kérelmét. Nincs elég szabadsága.' />
        <SuccessToast success={success} setSuccess={setSuccess} title='Elküldve' text='Kérelmét sikeresen elküldtük.' />
      </ToastContainer>
      <Container className='h-100 d-flex flex-column'>
        {currentlyOnLeave && <Row className='flex-grow-1'>
          <Col className='col-12'>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body className='d-flex flex-column align-items-center'>
                <Card.Title><h1 className='display-5 text-center text-danger'>Jelenleg szabadságon</h1></Card.Title>
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
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
              <Card.Body>
                <Card.Title><h1 className='display-6 text-center'>Szabadság kérelem küldése</h1></Card.Title>
                <CustomCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
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