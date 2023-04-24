import React, { useContext, useEffect, useState } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { getUserData } from '../appwrite';
import client from '../appwrite';
import { useNavigate } from 'react-router-dom';
import { CalendarContainer } from './CalendarContainer';
import Calendar from 'react-calendar';

const Home = () => {
  const {theme} = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    getUserData()
      .then((account) => {
        setUser(account);
      })
      .catch((error) => {
        setUser(null);
        navigate('/login');
        console.log(error);
      });
  }, []);

  const handleDateClick = (date) => {
    date.setHours(3, 0, 0, 0);
    setSelectedDates((prevSelectedDates) => {
      const dateString = date.toISOString().split('T')[0];
      return prevSelectedDates.includes(dateString)
        ? prevSelectedDates.filter((d) => d !== dateString)
        : [...prevSelectedDates, dateString];
    });
  }

  const titleClassName = ({ date, view }) => {
    if (view === 'month') {
      date.setHours(3, 0, 0, 0);
      const dateString = date.toISOString().split('T')[0];
      let classes = "";
      if (selectedDates.includes(dateString)) {
        classes += "selected-day";
      }

      if (dateString === new Date().toISOString().split('T')[0]) {
        classes += " current-day";
      }
      return classes;
    }
  }

  const testClick = (date, event) => {
    console.log(date);
    console.log(event);
    console.log(selectedDates);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectedDates);
    setSelectedDates([]);
  }

  return (
    
    <Container className='h-100 d-flex flex-column'>
      <Row className='flex-grow-1'>
        <Col className='col-5'>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-5 text-center'>{user?.name}</h1></Card.Title>
              <Card.Text>
                <p className='text-sm-center'>Rendelkezésre álló szabadságok száma / Összes szabadság száma</p>
                <p className='text-center'>{"<marado>/<összes>"}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-6 text-center'>Szabadság kérelem küldése</h1></Card.Title>
              <Card.Text>
                <CalendarContainer $dark={theme == "dark"}>
                  <Calendar
                    onClickDay={testClick}
                    onChange={handleDateClick}
                    tileClassName={titleClassName}
                    value={null}
                  />
                </CalendarContainer>
                <button type="button" className='btn btn-success mt-3' onClick={handleSubmit}>Küldés</button>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className='flex-grow-1'>
        <Col>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-6 text-center'>Naptár</h1></Card.Title>
              <Card.Text>
                
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
            <Card.Body>
              <Card.Title><h1 className='display-6 text-center'>Statisztika</h1></Card.Title>
              <Card.Text>
                <p>Megállapított szabadságok száma: {"<szám>"}</p>
                <p>Igénybevett szabadságok száma: {"<szám>"}</p>
                <p>Rendelkezésreálló szabadságok száma: {"<szám>"}</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Home