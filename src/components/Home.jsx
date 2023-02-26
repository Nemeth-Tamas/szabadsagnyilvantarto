import React, { useContext, useEffect, useState } from 'react'
import { Card, Container } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';

const Home = () => {
  const {theme} = useContext(ThemeContext);

  return (
    
    <Container>
      <Card bg={theme} text={theme == "light" ? "dark" : "light"} className="mt-5">
        <Card.Body>
          <Card.Title>{"<Felhasználónév>"}</Card.Title>
          <Card.Text>
            Hátralévő szabadságok száma: {"<szám>"}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Home