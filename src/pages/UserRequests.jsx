import React, { useContext, useEffect, useState } from 'react'
import { Button, Modal, Table, ToastContainer } from 'react-bootstrap'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import axios from 'axios';
import { BetterErrorToast, ErrorCodes, ModalCalendar } from '../components';
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
        setError(true);
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
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={ErrorCodes.ServerErrorFailedToLoadRequests} />
      </ToastContainer>
      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
      </div>
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
                {item.approved ? "" : item.rejected ? "" : <Button type='button' className='btn-danger my-1 shadow-smc' onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Biztosan törölni szeretné a kérelmet?')) {
                    handleDelete(item.$id);
                  }
                }}>Törlés</Button>}
                <Button type='button' className='btn-warning mx-2 me-0 my-1 shadow-smc' onClick={(e) => {
                  e.preventDefault();
                  handleView(item.$id);
                }}>Megtekintés</Button>
                {/* Development Function */}
                <Button type='button' className='btn-info me-0 my-1 shadow-smc' onClick={(e) => {
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

export default UserRequests