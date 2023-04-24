import React, { useContext, useEffect, useState } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { getUserData } from '../appwrite';
import client from '../appwrite';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const {theme} = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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