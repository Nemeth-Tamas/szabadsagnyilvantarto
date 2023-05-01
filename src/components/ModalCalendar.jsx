import React, { useEffect, useState } from 'react'
import CustomCalendarDisplayOnly from './CustomCalendarDisplayOnly'
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';

const ModalCalendar = ({ id }) => {
  const user = useSelector(selectUser);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const [shouldShow, setShouldShow] = useState(false);
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
    const options = {
      method: 'GET',
      url: `${url}/kerelmek/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }

    axios.request(options)
      .then((response) => {
        console.log(response);
        let takenDays = new Map();
        if (response.data.status == 'fail') throw new Error('Failed to get taken days');
        else setShouldShow(true);
        let kerelem = response.data.kerelem;
        kerelem.dates.forEach((date) => {
          takenDays.set(date, kerelem.type);
        });
        setTakenDays(takenDays);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  }, []);

  return (
    shouldShow &&
    <CustomCalendarDisplayOnly selectedDates={takenDays} context="modal" />
  )
}

export default ModalCalendar