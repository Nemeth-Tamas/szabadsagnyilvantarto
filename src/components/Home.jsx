import React, { useContext, useEffect, useState } from 'react'
import { Badge, ButtonGroup, Card, Col, Container, Row } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { getUserData } from '../appwrite';
import { useNavigate } from 'react-router-dom';
import { CalendarContainer } from './CalendarContainer';
import Calendar from 'react-calendar';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import CustomCalendar from './CustomCalendar';
import CustomCalendarDisplayOnly from './CustomCalendarDisplayOnly';

const Home = () => {
  const {theme} = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedType, setSelectedType] = useState('SZ');
  const [takenDays, setTakenDays] = useState(new Map([
    ['2023-04-29', 'SZ'],
    ['2023-04-30', 'T'],
    ['2023-05-01', 'H'],
    ['2023-05-02', 'A'],
    ['2023-05-03', 'SZSZ']
  ]));

  useEffect(() => {
    console.log(user);

    if (!user || !user.$id) {
      navigate('/login');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Dates:", selectedDates, "Selected Type:", selectedType);
    setSelectedDates([]);
  }

  const handleRadioChange = (e) => {
    setSelectedType(e.target.id);
  }

  return (
    
    <Container className='h-100 d-flex flex-column'>
      <Row className='flex-grow-1'>
        <Col className='col-lg-5 col-md-12'>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-5 text-center'>{user?.name}</h1></Card.Title>
              <Card.Text className='text-sm-center'>
                Rendelkezésre álló szabadságok száma / Összes szabadság száma
              </Card.Text>
              <Card.Text className='text-center'>
                {"<marado>/<összes>"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
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
              <button type="button" className='btn btn-success mt-3' onClick={handleSubmit}>Küldés</button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className='flex-grow-1'>
        <Col>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
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
        <Col className='col-lg-5 col-md-12'>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-6 text-center'>Statisztika</h1></Card.Title>
              <Card.Text>
                Megállapított szabadságok száma: {"<szám>"}
              </Card.Text>
              <Card.Text>
                Igénybevett szabadságok száma: {"<szám>"}
              </Card.Text>
              <Card.Text>
                Rendelkezésreálló szabadságok száma: {"<szám>"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Home