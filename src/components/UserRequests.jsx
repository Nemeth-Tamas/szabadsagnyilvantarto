import React, { useContext } from 'react'
import { Button, Modal, Table, Toast, ToastBody, ToastContainer, ToastHeader } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import ModalCalendar from './ModalCalendar';
import { useNavigate } from 'react-router';

const UserRequests = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const navigate = useNavigate();

  const handleCalendarClose = () => { setShowCalendar(false); setCalendarId(null); }

  useEffect(() => {
    // check if user has felhasznalo.delete_request permission
    // if not, return to /
    if (!user?.prefs?.perms?.includes('felhasznalo.delete_request')) {
      navigate('/');
    }
    handleUpdate();
  }, []);

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

  const handleView = (id) => {
    console.log(id);
    setCalendarId(id);
    setShowCalendar(true);
  };

  const handleUpdate = () => {
    axios.request({
      method: 'GET',
      url: `${url}/kerelmek/own`,
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
      <Table className={theme == "dark" ? 'table-dark table-striped mt-2' : 'table-striped mt-2'}>
        <thead>
          <tr>
            <th>#</th>
            <th>Dátumok</th>
            <th>Típus</th>
            <th>Státusz</th>
            <th>Visszautasítás oka</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.$id}>
              <td>{index + 1}</td>
              <td>{item.dates.join(", ")}</td>
              <td>{item.type == "SZ" ? "Szabadság" :
                item.type == "T" ? "Táppénz" :
                  item.type == "H" ? "Hozzátartozó halála" :
                    item.type == "A" ? "Apa szabadság" : "Szülési szabadság"}</td>
              <td>{item.approved ? "Elfogadva" : item.rejected ? "Elutasítva" : "Várakozik"}</td>
              <td>{item.rejectedMessage ? item.rejectedMessage : ""}</td>
              <td>
                {item.approved ? "" : item.rejected ? "" : <Button type='button' className='btn-danger my-1' onClick={(e) => {
                  e.preventDefault();
                  handleDelete(item.$id);
                }}>Törlés</Button>}
                <Button type='button' className='btn-warning mx-2 me-0 my-1' onClick={(e) => {
                  e.preventDefault();
                  handleView(item.$id);
                }}>Megtekintés</Button>
                {/* Development Function */}
                <Button type='button' className='btn-outline-info me-0 my-1' onClick={(e) => {
                  e.preventDefault();
                  async function copyToClipboard(text) {
                    if ('clipboard' in navigator) {
                      return await navigator.clipboard.writeText(text);
                    } else {
                      return document.execCommand('copy', true, text);
                    }
                  }
                  copyToClipboard(item.$id);
                }}>Copy ID</Button>
                </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default UserRequests