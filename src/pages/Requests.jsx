import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext'
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Button, Modal, Spinner, Table, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap';
import { BetterErrorToast, ErrorCodes, ModalCalendar } from '../components';

const Requests = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser)
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const [showRejectMessage, setShowRejectMessage] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const [errorCounter, setErrorCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const navigate = useNavigate();

  const handleCalendarClose = () => { setShowCalendar(false); setCalendarId(null); }
  const handleRejectClose = () => { setShowRejectMessage(false); setRejectId(null); setRejectMessage(''); }

  useEffect(() => {
    if (!user?.prefs?.perms?.includes('irodavezeto.approve')) {
      navigate('/');
    }
    handleUpdate();
  }, []);

  const handleView = (id) => {
    console.log(id);
    setCalendarId(id);
    setShowCalendar(true);
  };

  const loadMore = () => {
    // axios.request({
    //   method: 'GET',
    //   url: `${url}/kerelmek?offset=${data.length}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // })
    //   .then((response) => {
    //     if (response.status != 200) setError(true);
    //     if (response.data.status == 'fail') setError(true);
    //     console.log(response);
    //     setData(prevData => [...prevData, ...response.data.kerelmek.documents]);
    //     setTotal(response.data.kerelmek.total);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setError(true);
    //   });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GET_KERELMEK, JSON.stringify({
      submittingId: user.$id,
      offset: data.length
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setData(prevData => [...prevData, ...data.kerelmek.documents]);
      setTotal(data.kerelmek.total);
      setLoadingButton(false);
    })
    .catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const handleUpdate = () => {
    // axios.request({
    //   method: 'GET',
    //   url: `${url}/kerelmek`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'submittingId': user.$id
    //   }
    // })
    //   .then((response) => {
    //     if (response.status != 200) setError(true);
    //     if (response.data.status == 'fail') setError(true);
    //     console.log(response);
    //     setData(response.data.kerelmek.documents);
    //     setTotal(response.data.kerelmek.total);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setError(true);
    //   });
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_GET_KERELMEK, JSON.stringify({
      submittingId: user.$id
    }))
    .then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      if (data.status == 'fail') setError(true);
      setData(data.kerelmek.documents);
      setTotal(data.kerelmek.total);
      setErrorCounter(0);
      setLoading(false);
    })
    .catch((error) => {
      if (errorCounter < 3) {
        handleUpdate();
        setErrorCounter(errorCounter + 1);
      } else {
        console.log(error);
        setError(true);
      }
    });
  };

  const handleDelete = (id) => {
    console.log(id);

    // const options = {
    //   method: 'DELETE',
    //   url: `${url}/kerelmek/${id}`,
    //   headers: {
    //     'submittingId': user.$id
    //   }
    // }

    // console.log(options);

    // axios.request(options)
    //   .then((response) => {
    //     console.log(response);
    //     handleUpdate();
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    setLoading(true);
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_DELETE_KERELMEK, JSON.stringify({
      submittingId: user.$id,
      kerelemId: id
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);

      handleUpdate();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const handleApprove = (id) => {
    console.log(id);

    // const options = {
    //   method: 'PUT',
    //   url: `${url}/kerelmek/${id}/approve`,
    //   headers: {
    //     'submittingId': user.$id
    //   }
    // }

    // console.log(options);

    // axios.request(options)
    //   .then((response) => {
    //     console.log(response);
    //     handleUpdate();
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    setLoading(true);
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_APPROVE_KERELMEK, JSON.stringify({
      submittingId: user.$id,
      kerelemId: id
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      handleUpdate();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const handleReject = (id) => {
    console.log(id);

    setShowRejectMessage(true);
    setRejectId(id);
  };

  const handleActualReject = () => {
    handleRejectClose();
    console.log(rejectId);

    // const options = {
    //   method: 'PUT',
    //   url: `${url}/kerelmek/${rejectId}/reject`,
    //   headers: {
    //     'submittingId': user.$id
    //   },
    //   data: {
    //     rejectedMessage: rejectMessage
    //   }
    // }

    // console.log(options);

    // axios.request(options)
    //   .then((response) => {
    //     console.log(response);
    //     handleUpdate();
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    setLoading(true);
    functions.createExecution(import.meta.env.VITE_APPWRITE_FUNCTIONS_REJECT_KERELMEK, JSON.stringify({
      submittingId: user.$id,
      kerelemId: rejectId,
      rejectedMessage: rejectMessage
    })).then((response) => {
      let data = JSON.parse(response.responseBody);
      console.log(data);
      handleUpdate();
    }).catch((error) => {
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

      <Modal variant={theme} show={showRejectMessage} onHide={handleRejectClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Visszautasító üzenet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="rejectMessage">Üzenet:</label>
              <input type="text" className='form-control' name="rejectMessage" id="rejectMessage"
                value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} maxLength={40} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleRejectClose}>
            Bezárás
          </Button>
          <Button variant="success" onClick={handleActualReject}>
            Mentés
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.ServerErrorFailedToLoadRequests} />
      </ToastContainer>
      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          setLoading(true);
          handleUpdate();
        }}>Frissítés</Button>
        {total > data.length ? (
        <Button type='button' className='btn-primary mt-2 ms-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          setLoadingButton(true);
          loadMore();
        }}>
          {loadingButton && (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Több kérelem betöltése...
            </>
          )}
          {(data.length == 0 && !loadingButton) ? "Nincs több kérelem" : "Több kérelem betöltése"}
        </Button>
        ) : <></>}
      </div>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : (
        <Table className={theme == "dark" ? 'table-dark table-striped mt-2 shadow-dark' : 'table-striped mt-2 shadow-light'} >
          <thead>
            <tr>
              <th style={{ maxWidth: "12%", width: "12%" }}>Név</th>
              <th style={{ maxWidth: "27%", width: "27%" }}>Dátumok</th>
              <th style={{ maxWidth: "9%", width: "9%" }}>Típus</th>
              <th style={{ maxWidth: "9%", width: "9%" }}>Státusz</th>
              <th style={{ maxWidth: "27%", width: "27%" }}>Visszautasítás oka</th>
              <th style={{ maxWidth: "16%", width: "16%" }}>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.$id}>
                <td><strong>{item.submittingName}</strong></td>
                <td>{item.dates.join(", ")}</td>
                <td>{item.type == "SZ" ? "Szabadság" :
                  item.type == "T" ? "Táppénz" :
                    item.type == "H" ? "Hozzátartozó halála" :
                      item.type == "A" ? "Apa szabadság" : "Szülési szabadság"}</td>
                <td>{item.approved ? "Elfogadva" : item.rejected ? "Visszautasítva" : "Várakozik"}</td>
                <td>{item.rejectedMessage ? item.rejectedMessage : ""}</td>
                <td>
                  {item.approved ? "" : item.rejected ? "" : (<>
                    <Button type='button' className='btn-success my-1 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      handleApprove(item.$id);
                    }}>Elfogadás</Button>
                    {user.prefs.perms.includes('irpdavezeto.reject') ?
                      <Button type='button' className='btn-warning my-1 mx-1 shadow-smc' onClick={(e) => {
                        e.preventDefault();
                        handleReject(item.$id);
                      }}>Visszautasítás</Button> : ""}<br /></>
                  )}
                  <Button type='button' className='btn-primary mx-1 my-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    handleView(item.$id);
                  }}>Megtekintés</Button>
                  {user.prefs.perms.includes('hr.edit_user_current_state') ?
                    <Button type='button' className='btn-danger my-1 me-0 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Biztosan törölni szeretné a kérelmet?')) {
                        handleDelete(item.$id);
                      }
                    }}>Törlés</Button> : ""}
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
                    copyToClipboard(item.$id);
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

export default Requests