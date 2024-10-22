import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';
import { Button, Table, ToastContainer } from 'react-bootstrap';
import { BetterErrorToast, ErrorCodes, LoadingCircle } from '../components';
import { useNavigate } from 'react-router';
import { functions } from '../appwrite';

const Messages = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [errorCounter, setErrorCounter] = useState(0);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;

  useEffect(() => {
    if (!user || !user.$id) {
      navigate('/login');
      return;
    }
    handleUpdate();
  }, []);

  const loadMore = () => {
    axios.request({
      method: 'GET',
      url: `${url}/uzenetek/${user.$id}?offset=${data.length}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log(response.data.messages.documents);
      setData(prevData => [...prevData, ...response.data.messages.documents]);
      setTotal(response.data.messages.total);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const handleUpdate = () => {
    // axios.request({
    //   method: 'GET',
    //   url: `${url}/uzenetek/${user.$id}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // }).then((response) => {
    //   console.log(response.data.messages.documents);
    //   setData(response.data.messages.documents);
    //   setTotal(response.data.messages.total);
    // }).catch((error) => {
    //   console.log(error);
    //   setError(true);
    // });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GETUZENETEK, JSON.stringify({
      userId: user.$id
    }))
    .then((response) => {       
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setData(data.messages.documents);
      setTotal(data.messages.total);
      setErrorCounter(0);
      setLoading(false);
    })
    .catch((error) => {
      if (errorCounter < 3) {
        setErrorCounter(errorCounter + 1);
        handleUpdate();
      } else {
        console.log(error);
        setError(true);
      }
    });
  };

  return (
    <>
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.ServerErrorFailedToLoadMessages} />
      </ToastContainer>

      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
        {total > data.length ? (
        <Button type='button' className='btn-primary mt-2 ms-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          loadMore();
        }}>
          {data.length == 0 ? "Nincs több üzenet" : "Több üzenet betöltése"}
        </Button>
        ) : <></>}
      </div>
      {loading ? (
        <LoadingCircle />
      ) : (
        <Table className={theme == "dark" ? 'table-dark table-striped mt-2 shadow-dark' : 'table-striped mt-2 shadow-light'}>
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
      )}
    </>
  )
}

export default Messages