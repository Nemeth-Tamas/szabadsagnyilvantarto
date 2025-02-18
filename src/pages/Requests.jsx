import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext'
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../store/userSlice';
import { useNavigate } from 'react-router';
import { Button, Form, InputGroup, Modal, Spinner, Table, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap';
import { BetterErrorToast, ErrorCodes, ModalCalendar } from '../components';
import api from '../api';
import Fuse from 'fuse.js';

const Requests = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const [showRejectMessage, setShowRejectMessage] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const handleCalendarClose = () => { setShowCalendar(false); setCalendarId(null); }
  const handleRejectClose = () => { setShowRejectMessage(false); setRejectId(null); setRejectMessage(''); }

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    handleUpdate();
  }, []);

  const handleView = (id) => {
    console.log(id);
    setCalendarId(id);
    setShowCalendar(true);
  };

  const loadMore = () => {
    api.request({
      method: 'GET',
      url: `/requests?offset=${page * 25}`,
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
        setLoadingButton(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  }

  const handleUpdate = () => {
    setLoading(true);
    api.request({
      method: 'GET',
      url: `/requests`,
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
        setFilteredData(response.data);
        setPage(1);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  const handleDelete = (id) => {
    console.log(id);
    setLoading(true);
    const options = {
      method: 'DELETE',
      url: `/requests/${id}`,
    }

    api.request(options)
      .then((response) => {
        console.log(response);
        handleUpdate();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleApprove = (id) => {
    console.log(id);

    setLoading(true);
    const options = {
      method: 'PATCH',
      url: `/requests/${id}/approve`,
    }

    console.log(options);

    api.request(options)
      .then((response) => {
        console.log(response);
        handleUpdate();
      })
      .catch((error) => {
        console.log(error);
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

    const options = {
      method: 'PATCH',
      url: `/requests/${rejectId}/reject`,
      data: {
        reason: rejectMessage
      }
    }

    console.log(options);

    api.request(options)
      .then((response) => {
        console.log(response);
        handleUpdate();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [data]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(data);
      return;
    }

    const fuse = new Fuse(data, {
      keys: ['submittingName', 'dates', 'managerName'],
      threshold: 0.3
    });

    const result = fuse.search(query);
    setFilteredData(result.map((item) => item.item));
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
        {!(data.length < page * 25) ? (
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
        <InputGroup className='mt-2 ms-2' style={{ width: '25%' }}>
          <InputGroup.Text id='search-icon'>🔍</InputGroup.Text>
            <Form.Control 
              type='text' 
              placeholder='Keresés' 
              aria-label='Keresés' 
              aria-describedby='search-icon' 
              value={searchQuery} 
              onChange={(e) => handleSearch(e.target.value)}
            />
        </InputGroup>
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
            {filteredData.map((item, index) => (
              <tr key={item.id}>
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
                      handleApprove(item.id);
                    }}>Elfogadás</Button>
                      <Button type='button' className='btn-warning my-1 mx-1 shadow-smc' onClick={(e) => {
                        e.preventDefault();
                        handleReject(item.id);
                      }}>Visszautasítás</Button><br /></>
                  )}
                  <Button type='button' className='btn-primary mx-1 my-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    handleView(item.id);
                  }}>Megtekintés</Button>
                  {user?.role == "admin" ?
                    <Button type='button' className='btn-danger my-1 me-0 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Biztosan törölni szeretné a kérelmet?')) {
                        handleDelete(item.id);
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

export default Requests