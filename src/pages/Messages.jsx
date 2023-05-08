import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';
import { Button, Table, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap';
import { ErrorToast } from '../components';

const Messages = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;

  useEffect(() => {
    handleUpdate();
  }, []);

  const handleUpdate = () => {
    axios.request({
      method: 'GET',
      url: `${url}/uzenetek/${user.$id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log(response.data.messages.documents);
      setData(response.data.messages.documents);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <ErrorToast error={error} setError={setError} text='Nem sikerült lekérni az üzeneteket. Kérjük próbálja újra később.' />
      </ToastContainer>

      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
      </div>
      <Table className={theme == "dark" ? 'table-dark table-striped mt-2' : 'table-striped mt-2'}>
        <thead>
          <tr>
            <th style={{ maxWidth: "3%", width: "3%" }}>#</th>
            <th style={{ maxWidth: "20%", width: "20%" }}>Feladó</th>
            <th style={{ maxWidth: "20%", width: "20%" }}>Dátum</th>
            <th style={{ maxWidth: "57%", width: "57%" }}>Üzenet</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index + item.$id}>
              <td>{index + 1}</td>
              <td>{item.sendingName}</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{item.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default Messages