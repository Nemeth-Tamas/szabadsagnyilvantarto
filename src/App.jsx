import { useContext, useEffect, useState } from 'react';
import { Home, Messages, UserRequests, Requests, Login, UsersList, UserEdit, Plan } from './pages';
import { MainNavbar } from './components';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeContext } from './ThemeContext';
import './App.css';
import { useKeyboard } from './KeyboardContext';
import { MdNotificationsActive } from "react-icons/md";
import { useWebSocket } from './WebSocketContext';
import { useSelector } from 'react-redux';
import { selectUser } from './store/userSlice';

function App() {
  const {theme} = useContext(ThemeContext);
  const { onKeyPressed } = useKeyboard();
  const {messages, isConnected} = useWebSocket();
  const user = useSelector(selectUser);
  const [notificationsList, setNotificationsList] = useState([]);

  useEffect(() => {
    if (!import.meta.env.VITE_DEVMODE) return;
    onKeyPressed("ctrl+alt+shift+s", () => {
      setNotificationsList(prev => [...prev, { message: '1', type: 'kerelmek_new_notification' }]);
    });
  }, []);

  useEffect(() => {
      if (user?.role !== "felhasznalo" && messages.length > 0) {
        const message = messages[messages.length - 1];
  
        switch (message.type) {
          case "kerelmek_new_notification":
            setNotificationsList(prev => [...prev, message]);
            break;
          case "error":
            console.error('WebSocket error:', message);
            break;
          default:
            break;
        }
      }
    }, [messages, user?.role]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* <ToastContainer className='p-3' position='top-start' style={{ zIndex: 9999 }}> */}
      <div style={{
        position: 'fixed',
        top: '60px',
        left: '20px',
        width: '300px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {notificationsList.map((notification, index) => (
          <Toast key={index} show={true} onClose={() => {
            setNotificationsList(notificationsList.filter((item, i) => i !== index));
          }} animation={true}>
            <Toast.Header>
              <MdNotificationsActive size={20} />
              <strong className='me-auto px-1'>Értesítés</strong>
            </Toast.Header>
            <Toast.Body>
              Önnek kérelme érkezett amit {notification.message} felhasználó hozott létre.
            </Toast.Body>
          </Toast>
        ))}
      </div>
      {/* </ToastContainer> */}
      <Container fluid className={theme == "dark" ? "bg-semidark" : ""} style={{ minHeight: '100vh' }}>
        <BrowserRouter>
          <MainNavbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/userrequests' element={<UserRequests />} />
            <Route path='/login' element={<Login />} />
            <Route path='/requests' element={<Requests />} />
            <Route path='/users' element={<UsersList />} />
            <Route path='/useredit' element={<UserEdit />} />
            <Route path='/plan' element={<Plan />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  )
}

export default App
