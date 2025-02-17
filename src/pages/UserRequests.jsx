import React, { useContext, useEffect, useState } from 'react'
import { Button, Modal, Spinner, Table, ToastContainer } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../store/userSlice';
import { BetterErrorToast, ErrorCodes, ModalCalendar } from '../components';
import { useNavigate } from 'react-router';
import api from '../api';

const UserRequests = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const navigate = useNavigate();

  const handleCalendarClose = () => { setShowCalendar(false); setCalendarId(null); }

  useEffect(() => {
    // check if user has felhasznalo.delete_request permission
    // if not, return to /
    if (!token) {
      navigate('/login');
    }
    handleUpdate();
  }, []);

  const handleDelete = (id) => {
    console.log(id);

    const options = {
      method: 'DELETE',
      url: `/requests/${id}`,
    };

    api.request(options)
      .then((response) => {
        console.log(response);
        handleUpdate();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleView = (id) => {
    console.log(id);
    setCalendarId(id);
    setShowCalendar(true);
  };

  const loadMore = () => {
    api.request({
      method: 'GET',
      url: `/requests/own?offset=${page * 25}`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        console.log(response);
        response.data.map((item) => {
          item.dates = item.dates.map((date) => {
            let newdate = new Date(date);
            return newdate.toLocaleDateString();
          });
          return item;
        });
        setData(prevData => [...prevData, ...response.data]);
        setPage(prevPage => prevPage + 1);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  const handleUpdate = () => {
    setLoading(true);
    api.request({
      method: 'GET',
      url: `/requests/own`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        console.log(response);
        response.data.map((item) => {
          item.dates = item.dates.map((date) => {
            let newdate = new Date(date);
            return newdate.toLocaleDateString();
          });
          return item;
        });
        setData(response.data);
        setPage(1);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  return (
    <>
      <Modal variant={theme} show={showCalendar} onHide={handleCalendarClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Dátumok</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalCalendar id={calendarId} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant={theme} onClick={handleCalendarClose}>
            Bezárás
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.ServerErrorFailedToLoadRequests} />
      </ToastContainer>
      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
        {!(data.length < page * 25) ? (
        <Button type='button' className='btn-primary mt-2 ms-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          loadMore();
        }}>
          {(data.length == 0) ? "Nincs több kérelem" : "Több kérelem betöltése"}
        </Button>
        ) : <></>}
      </div>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : (
        <Table className={theme == "dark" ? 'table-dark table-striped mt-2 shadow-dark' : 'table-striped mt-2 shadow-light'}>
          <thead>
            <tr>
              <th style={{maxWidth: "3%", width: "3%"}}>#</th>
              <th style={{maxWidth: "32%", width: "32%"}}>Dátumok</th>
              <th style={{maxWidth: "9%", width: "9%"}}>Típus</th>
              <th style={{maxWidth: "9%", width: "9%"}}>Státusz</th>
              <th style={{maxWidth: "32%", width: "32%"}}>Visszautasítás oka</th>
              <th style={{maxWidth: "16%", width: "16%"}}>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.dates.join(", ")}</td>
                <td>{item.type == "SZ" ? "Szabadság" :
                  item.type == "T" ? "Táppénz" :
                    item.type == "H" ? "Hozzátartozó halála" :
                      item.type == "A" ? "Apa szabadság" : "Szülési szabadság"}</td>
                <td>{item.approved ? "Elfogadva" : item.rejected ? "Visszautasítva" : "Várakozik"}</td>
                <td>{item.rejectedMessage ? item.rejectedMessage : ""}</td>
                <td>
                  {item.approved ? "" : item.rejected ? "" : <Button type='button' className='btn-danger my-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm('Biztosan törölni szeretné a kérelmet?')) {
                      handleDelete(item.id);
                    }
                  }}>Törlés</Button>}
                  <Button type='button' className='btn-warning mx-2 me-0 my-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    handleView(item.id);
                  }}>Megtekintés</Button>
                  {/* Development Function */}
                  {/* <Button type='button' className='btn-info me-0 my-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    async function copyToClipboard(text) {
                      if ('clipboard' in navigator) {
                        return await navigator.clipboard.writeText(text);
                      } else {
                        return document.execCommand('copy', true, text);
                      }
                    }
                    copyToClipboard(item.id);
                  }}></Button> */}
                  </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default UserRequests