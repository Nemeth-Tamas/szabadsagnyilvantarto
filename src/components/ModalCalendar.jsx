import React, { useEffect, useState } from 'react'
import CustomCalendarDisplayOnly from './CustomCalendarDisplayOnly'
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { functions } from '../appwrite';

const ModalCalendar = ({ id, userData = null, userStats = null, tappenz = null }) => {
  const user = useSelector(selectUser);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [takenDays, setTakenDays] = useState(new Map([
    ['2023-04-29', 'SZ'],
    ['2023-04-30', 'T'],
    ['2023-05-01', 'H'],
    ['2023-05-02', 'A'],
    ['2023-05-03', 'SZSZ']
  ]));

  useEffect(() => {
    console.log(id);
    
    // send axios request to get days taken by user with id
    if (userData == null && id != null) {
      // const options = {
      //   method: 'GET',
      //   url: `${url}/kerelmek/${id}`,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'submittingId': user.$id
      //   }
      // }
  
      // axios.request(options)
      //   .then((response) => {
      //     console.log(response);
      //     let takenDays = new Map();
      //     if (response.data.status == 'fail') throw new Error('Failed to get taken days');
      //     else setShouldShow(true);
      //     let kerelem = response.data.kerelem;
      //     kerelem.dates.forEach((date) => {
      //       takenDays.set(date, kerelem.type);
      //     });
      //     setTakenDays(takenDays);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     setError(true);
      //   });
      functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GET_KERELMEK_BY_ID, JSON.stringify({
        submittingId: user.$id,
        kerelemId: id
      })).then((response) => {
        let data = JSON.parse(response.responseBody);
        console.log(data);
        if (data.status == 'fail') setError(true);
        let takenDays = new Map();
        data.kerelem.dates.forEach((date) => {
          takenDays.set(date, data.kerelem.type);
        });
        setTakenDays(takenDays);
        setLoading(false);
        setShouldShow(true);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
    } else if (userData != null && userData != undefined && id == null) {
      console.log("HERE",userStats);
      let takenDays = new Map();
      userData.forEach((document) => {
        document.dates.forEach(date => {
          takenDays.set(date, document.type);
        })
      })
      setTakenDays(takenDays);
      setLoading(false);
      setShouldShow(true);
    } else {
      setTakenDays(new Map());
      setLoading(false);
      setShouldShow(true);
    }
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  } else {
    return (
      shouldShow &&
      <div>
        {userStats && 
          <div>
            <span>Összes szabadság: {userStats?.maxdays}</span><br />
            <span>Rendelkezésre álló szabadságok: {userStats?.remainingdays}</span><br />
            <span>Igénybevett szabadságok: {userStats?.maxdays - userStats?.remainingdays}</span><br />
            <span>Az évben használt összes táppénz: {tappenz}</span>
          </div>
        }
  
        <CustomCalendarDisplayOnly selectedDates={takenDays} context="modal" />
      </div>
    );
  }

}

export default ModalCalendar