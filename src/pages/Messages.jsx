import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../store/userSlice';
import { Button, Table, ToastContainer } from 'react-bootstrap';
import { BetterErrorToast, ErrorCodes, LoadingCircle } from '../components';
import { useNavigate } from 'react-router';
import api from '../api';

const Messages = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    handleUpdate();
  }, []);

  const loadMore = () => {
    api.request({
      method: 'GET',
      url: `/uzenetek?offset=${page*25}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log(response.data);
      setData(prevData => [...prevData, ...response.data]);
      setPage(prevPage => prevPage + 1);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const handleUpdate = () => {
    api.request({
      method: 'GET',
      url: `/messages`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      console.log(response.data);
      setData(response.data);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  return (
    <>
      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.ServerErrorFailedToLoadMessages} />
      </ToastContainer>

      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
        {!(data.length < page*25) ? (
        <Button type='button' className='btn-primary mt-2 ms-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          loadMore();
        }}>
          {data.length == 0 ? "Nincs több üzenet" : "Több üzenet betöltése"}
        </Button>
        ) : <></>}
      </div>

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
    </>
  )
}

export default Messages