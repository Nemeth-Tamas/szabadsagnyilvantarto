import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext'
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Button, Modal, Table, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap';
import ModalCalendar from './ModalCalendar';

const Requests = () => {
  const {theme} = useContext(ThemeContext);
  const user = useSelector(selectUser)
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const [showRejectMessage, setShowRejectMessage] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');
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

  const handleUpdate = () => {
    axios.request({
      method: 'GET',
      url: `${url}/kerelmek`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        console.log(response);
        setData(response.data.kerelmek.documents);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };

  const handleDelete = (id) => {
    console.log(id);
    
    const options = {
      method: 'DELETE',
      url: `${url}/kerelmek/${id}`,
      headers: {
        'submittingId': user.$id
      }
    }

    console.log(options);

    axios.request(options)
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

    const options = {
      method: 'PUT',
      url: `${url}/kerelmek/${id}/approve`,
      headers: {
        'submittingId': user.$id
      }
    }

    console.log(options);

    axios.request(options)
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
      method: 'PUT',
      url: `${url}/kerelmek/${rejectId}/reject`,
      headers: {
        'submittingId': user.$id
      },
      data: {
        rejectedMessage: rejectMessage
      }
    }

    console.log(options);

    axios.request(options)
      .then((response) => {
        console.log(response);
        handleUpdate();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Modal variant={theme} show={showCalendar} onHide={handleCalendarClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Időpontok</Modal.Title>
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
          <Modal.Title>Elutasító üzenet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="rejectMessage">Üzenet:</label>
              <input type="text" className='form-control' name="rejectMessage" id="rejectMessage" 
              value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleRejectClose}>
            Bezárás
          </Button>
          <Button variant="success" onClick={handleActualReject}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer
        className='p-3'
        position='bottom-end'
        style={{ zIndex: 9999 }}
      >
        <Toast show={error} onClose={() => setError(false)} delay={3000} autohide animation={true} className='bg-danger text-white' >
          <ToastHeader>
            <strong className="me-auto">Hiba</strong>
          </ToastHeader>
          <ToastBody>
            Nem sikerült lekérni a kérelmeket. Kérjük próbálja újra később.
          </ToastBody>
        </Toast>
      </ToastContainer>
      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
      </div>
      <Table className={theme == "dark" ? 'table-dark table-striped mt-2' : 'table-striped mt-2'} >
        <thead>
          <tr>
            <th style={{maxWidth: "12%", width: "12%"}}>Név</th>
            <th style={{maxWidth: "28%", width: "28%"}}>Dátumok</th>
            <th style={{maxWidth: "9%", width: "9%"}}>Típus</th>
            <th style={{maxWidth: "9%", width: "9%"}}>Státusz</th>
            <th style={{maxWidth: "28%", width: "28%"}}>Visszautasítás oka</th>
            <th style={{maxWidth: "14%", width: "14%"}}>Műveletek</th>
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
              <td>{item.approved ? "Elfogadva" : item.rejected ? "Elutasítva" : "Várakozik"}</td>
              <td>{item.rejectedMessage ? item.rejectedMessage : ""}</td>
              <td>
                {item.approved ? "" : item.rejected ? "" : (<>
                <Button type='button' className='btn-success my-1 mx-1' onClick={(e) => {
                  e.preventDefault();
                  handleApprove(item.$id);
                }}>Elfogadás</Button>
                {user.prefs.perms.includes('irpdavezeto.reject') ?
                <Button type='button' className='btn-warning my-1 mx-1' onClick={(e) => {
                  e.preventDefault();
                  handleReject(item.$id);
                }}>Elutasítás</Button> : "" }<br /></>
                )}
                <Button type='button' className='btn-primary mx-1 my-1' onClick={(e) => {
                  e.preventDefault();
                  handleView(item.$id);
                }}>Megtekintés</Button>
                {user.prefs.perms.includes('hr.edit_user_current_state') ? 
                <Button type='button' className='btn-danger my-1 me-0 mx-1' onClick={(e) => {
                  e.preventDefault();
                  handleDelete(item.$id);
                }}>Törlés</Button> : ""}
                {/* Development Function */}
                <Button type='button' className='btn-info me-0 my-1' onClick={(e) => {
                  e.preventDefault();
                  async function copyToClipboard(text) {
                    if ('clipboard' in navigator) {
                      return await navigator.clipboard.writeText(text);
                    } else {
                      return document.execCommand('copy', true, text);
                    }
                  }
                  copyToClipboard(item.$id);
                }}></Button>
                </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default Requests