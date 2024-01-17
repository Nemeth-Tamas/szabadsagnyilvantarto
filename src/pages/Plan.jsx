
import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, ToastContainer } from 'react-bootstrap';
import { BetterErrorToast, CustomCalendar, ErrorCodes, SuccessToast } from '../components';
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';
import { useNavigate } from 'react-router';

const MonthCard = ({ month, theme, selectedDates, setSelectedDates }) => {
  let monthStr = "";
  switch (month) {
    case 1:
      monthStr = "Január";
      break;
    case 2:
      monthStr = "Február";
      break;
    case 3:
      monthStr = "Március";
      break;
    case 4:
      monthStr = "Április";
      break;
    case 5:
      monthStr = "Május";
      break;
    case 6:
      monthStr = "Június";
      break;
    case 7:
      monthStr = "Július";
      break;
    case 8:
      monthStr = "Augusztus";
      break;
    case 9:
      monthStr = "Szeptember";
      break;
    case 10:
      monthStr = "Október";
      break;
    case 11:
      monthStr = "November";
      break;
    case 12:
      monthStr = "December";
      break;
    default:
      monthStr = "Hiba";
  }
  return (
    <Card bg={theme} text={theme == "light" ? "dark" : "light"} className={theme == "light" ? "mt-5 shadow-light" : "mt-5 shadow-dark"}>
      <Card.Title className='text-center mt-3'>{monthStr}</Card.Title>
      <Card.Body className='mt-0 pt-0'>
        <CustomCalendar selectedDates={selectedDates} setSelectedDates={setSelectedDates} displayMonth={month} />
      </Card.Body>
    </Card>
  );
};

const Plan = () => {
  const { theme } = useContext(ThemeContext);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const user = useSelector(selectUser);
  const [selectedDates, setSelectedDates] = useState([]);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.RequestNotSent);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);

    if (!user || !user.$id) {
      navigate('/login');
    }

    if (user?.$id) {
      let options = {
        method: 'GET',
        url: `${url}/plans/${user.$id}`,
        headers: {
          'Content-Type': 'application/json',
          'submittingId': user.$id
        }
      }

      setErrorCode(ErrorCodes.ServerError);
      axios.request(options).then((response) => {
        if (response.status !== 200) setError(true);
        if (response.data.status == "fail") setError(true);
        if (response.data.filledOut == true) {
          navigate('/');
        }
      }).catch((error) => {});
    }
  }, []);

  const handleSave = async () => {
    let options = {
      method: 'POST',
      url: `${url}/plans`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        planDays: selectedDates.sort()
      }
    }

    console.log(options);

    setErrorCode(ErrorCodes.ServerError);
    axios.request(options).then((response) => {
      if (response.status !== 200) setError(true);
      setErrorCode(ErrorCodes.FailedToSavePlan);
      if (response.data.status == "fail") {
        if (response.data.errorCode == "emptyPlan" || response.data.errorCode == "notAllDaysUsed") {
          console.log(response.data);
          setErrorCode(ErrorCodes.PlanContainsToFewDays);
        } else if (response.data.errorCode == "tooManyDaysUsed") {
          setErrorCode(ErrorCodes.PlanContainsToManyDays);
        } else if (response.data.errorCode == "noDaysSet") {
          setErrorCode(ErrorCodes.PlanMaxNotSet);
        }
        setError(true);
      } else {
        navigate('/');
      }

    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={errorCode} />
      </ToastContainer>
      <Container className='h-100 d-flex flex-column'>
        <Row className='mt-5 w-100'>
          <h3 className='mx-auto'>Összes szabadság: {user?.prefs?.maxdays}</h3>
          <h3 className='mx-auto'>Kijelölt szabadság: {selectedDates.length}</h3>
        </Row>
        <Row className='mt-auto w-100'>
          <Button variant='primary' className='mx-auto mb-0 w-25' onClick={(e) => {
            e.preventDefault();
            handleSave();
          }}>Terv Mentése</Button>
        </Row>
        <Row>
          <Col lg={4} sm={12}>
            <MonthCard month={1} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={2} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={3} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
        </Row>
        <Row>
          <Col lg={4} sm={12}>
            <MonthCard month={4} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={5} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={6} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
        </Row>
        <Row>
          <Col lg={4} sm={12}>
            <MonthCard month={7} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={8} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={9} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col lg={4} sm={12}>
            <MonthCard month={10} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={11} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
          <Col lg={4} sm={12}>
            <MonthCard month={12} theme={theme} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
          </Col>
        </Row>

      </Container>
    </>
  );
};

export default Plan;
