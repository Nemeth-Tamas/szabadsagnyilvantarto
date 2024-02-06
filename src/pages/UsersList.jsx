import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Button, ButtonGroup, Modal, Table, ToastContainer } from 'react-bootstrap';
import { ModalCalendar, SuccessToast, ErrorCodes, BetterErrorToast } from '../components';
import bcrypt from 'bcryptjs';

const UsersList = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.UnknownError);
  const url = import.meta.env.VITE_BACKEND_BASEADDRESS;
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userCalendarData, setUserCalendarData] = useState(null);
  const [userCalendarStats, setUserCalendarStats] = useState(null);
  const [tappenz, setTappenz] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [sendMessageId, setSendMessageId] = useState('');
  const [sendMessageText, setSendMessageText] = useState('');
  const [uidForDownload, setUidForDownload] = useState('');
  const [unameForDownload, setUnameForDownload] = useState('');

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPassword2, setUserPassword2] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userManager, setUserManager] = useState('');
  const [userPerms, setUserPerms] = useState([]);
  const [userMaxdays, setUserMaxdays] = useState(0);
  const [userDaysLeft, setUserDaysLeft] = useState(-1);

  const handleCalendarClose = () => { setShowCalendar(false); setUserCalendarData(null); setUserCalendarStats(null); }
  const handleCreateUserClose = () => {
    setShowCreateUser(false);
    setUserEmail('');
    setUserPassword('');
    setUserPassword2('');
    setUserUsername('');
    setUserRole('');
    setUserManager('');
    setUserPerms([]);
    setUserMaxdays(0);
    setUserDaysLeft(-1);
  }
  const handleSendMessageClose = () => { setShowSendMessage(false); setSendMessageId(''); setSendMessageText(''); }

  useEffect(() => {
    console.log(user);
    if (!user?.prefs?.perms?.includes('irodavezeto.list_own') &&
      !user?.prefs?.perms?.includes('jegyzo.list_all')) {
      navigate('/');
    }
    handleUpdate();
    // handleView(user.$id);
  }, []);

  const handleUpdate = () => {
    setErrorCode(ErrorCodes.FailedToLoadUsers);
    axios.request({
      method: 'GET',
      url: `${url}/users`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        console.log(response);
        setData(response.data.usersList.users);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };
  // TODO: Everywhere change setError to return
  const handleView = (id, name) => {
    setErrorCode(ErrorCodes.FailedToLoadSzabadsag);
    axios.request({
      method: 'GET',
      url: `${url}/szabadsagok/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      setUserCalendarData(response.data.szabadsag.documents);
      setUidForDownload(id);
      setUnameForDownload(name)

      // get user max and left days
      setErrorCode(ErrorCodes.FailedToLoadUser);
      axios.request({
        method: 'GET',
        url: `${url}/users/${id}`,
        headers: {
          'Content-Type': 'application/json',
          'submittingId': user.$id
        }
      }).then((response) => {
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        console.log(response);
        setUserCalendarStats(response.data.user.prefs);
        // get sick days
        const options = {
          method: 'GET',
          url: `${url}/tappenz/${id}/cumulative`,
          headers: {
            'Content-Type': 'application/json',
            'submittingId': user.$id
          }
        }

        axios.request(options).then((response) => {
          if (response.status != 200) { setError(true); return; }
          if (response.data.status == 'fail') { setError(true); return; }

          setTappenz(response.data.cumulative);
          setShowCalendar(true);
        }).catch((error) => { 
          console.log(error);
          setError(true);
        });
      }).catch((error) => {
        console.log(error);
        setErrorCode(ErrorCodes.FailedToLoadUser);
        setError(true);
      });

    }).catch((error) => {
      console.log(error);
      setErrorCode(ErrorCodes.FailedToLoadSzabadsag);
      setError(true);
    });
  };

  const deleteUser = (id) => {
    setErrorCode(ErrorCodes.ErrorWhileDeletingUser);
    axios.request({
      method: 'DELETE',
      url: `${url}/users/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);
      handleUpdate();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const deletePlan = (id) => {
    if (id == "reset") setErrorCode(ErrorCodes.ErrorWhileDeletingAllPlans);
    else setErrorCode(ErrorCodes.ErrorWhileDeletingSignlePlan);
    axios.request({
      method: 'DELETE',
      url: `${url}/plans/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const createUser = () => {
    setShowCreateUser(true);
  };

  const handleSubmitCreate = () => {
    let postUserEmail = userEmail.toLowerCase().trim();
    let postUserPassword = "";
    let postUserUsername = userUsername;
    let postUserRole = userRole;
    let postUserManager = userManager;
    let postUserPerms = [];
    let postUserMaxdays = userMaxdays;
    let postUserDaysLeft = userDaysLeft;

    if (userRole == '') {
      console.log('userRole is empty');
      setErrorCode(ErrorCodes.UserRoleEmpty);
      setError(true);
      return;
    }

    if (userManager == '') {
      console.log('userManager is empty');
      setErrorCode(ErrorCodes.UserManagerEmpty);
      setError(true);
      return;
    }

    let perms = [
      'felhasznalo.request',
      'felhasznalo.delete_request',
      'irodavezeto.approve',
      'irpdavezeto.reject',
      'irodavezeto.message_send',
      'irodavezeto.list_own',
      'jegyzo.edit_user',
      'jegyzo.create_user',
      'jegyzo.delete_user',
      'jegyzo.list_all',
      'hr.edit_user_perms',
      'hr.edit_user_current_state'
    ];

    let felhasznaloPreset = [perms[0], perms[1]];
    let irodavezetoPreset = [...felhasznaloPreset, perms[2], perms[3], perms[4], perms[5]];
    let jegyzoPreset = [...felhasznaloPreset, perms[2], perms[3], perms[4], perms[6], perms[7], perms[8], perms[9]];
    let adminPreset = [...jegyzoPreset, perms[10], perms[11]];

    if (postUserRole == 'felhasznalo') postUserPerms = felhasznaloPreset;
    if (postUserRole == 'irodavezeto') postUserPerms = irodavezetoPreset;
    if (postUserRole == 'jegyzo') postUserPerms = jegyzoPreset;
    if (postUserRole == 'admin') postUserPerms = adminPreset;

    if (userPassword != userPassword2) {
      console.log('passwords dont match');
      setErrorCode(ErrorCodes.PasswordsNotMatch);
      setError(true);
      return;
    }

    if (postUserEmail.split('@')[1] != user.email.split('@')[1]) {
      console.log('email domains dont match');
      setErrorCode(ErrorCodes.EmailDomainDoesNotMatch);
      setError(true);
      return;
    }

    setErrorCode(ErrorCodes.FailedToEncryptPassword);
    bcrypt.hash(userPassword.trim(), 10).then((hash) => {
      console.log(hash);
      postUserPassword = hash;

      if (postUserEmail == '' || postUserPassword == '' || postUserUsername == '' || postUserRole == '' || postUserManager == '' || postUserPerms == '' || postUserMaxdays == '' || postUserDaysLeft == '') {
        setErrorCode(ErrorCodes.EmptyField);
        setError(true);
        return;
      }

      if (postUserEmail.length < 5 || postUserPassword.length < 5) {
        setErrorCode(ErrorCodes.UsernameOrPasswordTooShort);
        setError(true);
        return;
      }

      if (!postUserEmail.includes('@') || !postUserEmail.includes('.')) {
        setErrorCode(ErrorCodes.UsernameDoesNotContainAt);
        setError(true);
        return;
      }

      if (userDaysLeft == -1) postUserDaysLeft = postUserMaxdays;

      setErrorCode(ErrorCodes.FailedToRegisterUser);
      axios.request({
        method: 'POST',
        url: `${url}/users/register`,
        headers: {
          'Content-Type': 'application/json',
          'submittingId': user.$id
        },
        data: {
          email: postUserEmail,
          password: postUserPassword,
          name: postUserUsername,
          role: postUserRole,
          manager: postUserManager,
          perms: postUserPerms,
          maxdays: postUserMaxdays,
          remainingdays: postUserDaysLeft
        }
      }).then((response) => {
        if (response.status != 200) setError(true);
        if (response.data.status == 'fail') setError(true);
        console.log(response);
        handleUpdate();
        handleCreateUserClose();
        setSuccess(true);
      }).catch((error) => {
        console.log(error);
        setError(true);
      });

    }).catch((error) => {
      console.log(error);
      setErrorCode(ErrorCodes.FailedToEncryptPassword);
      setError(true);
    });

  };

  const sendMessage = (id) => {
    setShowSendMessage(true);
    setSendMessageId(id);
  }

  const handleSubmitMessage = () => {
    let postUserId = sendMessageId;
    let postMessageContent = sendMessageText;
    let postMessageDate = new Date().toISOString();

    if (postMessageContent == '') {
      setErrorCode(ErrorCodes.EmptyField);
      setError(true);
      return;
    }

    setErrorCode(ErrorCodes.FailedToSendMessage);
    axios.request({
      method: 'POST',
      url: `${url}/uzenetek/create`,
      headers: {
        'Content-Type': 'application/json',
        'submittingId': user.$id
      },
      data: {
        userId: postUserId,
        message: postMessageContent,
        date: postMessageDate
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      if (response.data.status == 'fail') setError(true);
      console.log(response);
      handleUpdate();
      handleSendMessageClose();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  }

  const editUser = (id) => {
    console.log(id);
    navigate(`/useredit?userid=${id}`);
  }

  const handleDownload = (e, uid) => {
    e.preventDefault();
    let options = {
      method: 'GET',
      url: `${url}/plans/${uid}/excel`,
      headers: {
        'submittingId': user.$id
      },
      responseType: 'arraybuffer'
    }

    axios.request(options).then((response) => {
      // Download the returned excel file from buffer
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      let date = new Date();
      let dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '_' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
      let filename = unameForDownload.replace(/ /g, '-') + '_' + dateString + '.xlsx';
      link.setAttribute('download', filename);
      document.body.appendChild(link);

      link.click();
      link.remove();

      console.log(response);
    }).catch((error) => { console.log(error) });
  }

  return (
    <>
      <Modal variant={theme} show={showCalendar} onHide={handleCalendarClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Szabadságok</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalCalendar userData={userCalendarData} userStats={userCalendarStats} tappenz={tappenz} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant={theme} onClick={(e) => handleDownload(e, uidForDownload)}>
            Terv letöltése
          </Button>
          <Button variant={theme} onClick={() => handleCalendarClose()}>
            Bezárás
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal variant={theme} show={showSendMessage} onHide={handleSendMessageClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Üzenet küldés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="messageContent" className="form-label">Üzenet tartalma</label>
              <textarea className="form-control" id="messageContent" rows="3" value={sendMessageText} onChange={(e) => setSendMessageText(e.target.value)}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={theme} onClick={() => handleSendMessageClose()}>
            Bezárás
          </Button>
          <Button variant="success" onClick={handleSubmitMessage}>
            Mentés
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal variant={theme} show={showCreateUser} onHide={handleCreateUserClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Felhasználó létrehozása</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="userEmail" className="form-label">Felhasználó név @ azonosító</label>
              <input type="email" className="form-control" id="userEmail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="userPassword" className="form-label">Jelszó</label>
              <input type="password" className="form-control" id="userPassword" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="userPassword" className="form-label">Jelszó Mégegyszer</label>
              <input type="password" className="form-control" id="userPassword2" value={userPassword2} onChange={(e) => setUserPassword2(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="userUsername" className="form-label">Név</label>
              <input type="text" className="form-control" id="userUsername" value={userUsername} onChange={(e) => setUserUsername(e.target.value)} />
            </div>
            {user?.prefs?.role == 'admin' && (
              <>
                <div className="mb-3">
                  <label htmlFor="userMaxdays" className='form-label'>Összes szabadság száma</label>
                  <input type="number" min={0} max={200} className="form-control" id="userMaxdays" value={userMaxdays} onChange={(e) => setUserMaxdays(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="userDaysLeft" className='form-label'>Hátralévő szabadság száma</label>
                  <input type="number" min={-1} max={200} className="form-control" id="userDaysLeft" value={userDaysLeft} onChange={(e) => setUserDaysLeft(e.target.value)} />
                </div>
              </>
            )}
            <div className="mb-3">
              <label htmlFor="userRole" className="form-label">Szerepkör</label>
              <select className="form-select" id="userRole" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                <option value=''>Válasszon...</option>
                <option value='felhasznalo'>Felhasználó</option>
                <option value='irodavezeto'>Irodavezető</option>
                {user?.prefs?.role == 'admin' && <option value='jegyzo'>Jegyző</option>}
                {user?.prefs?.role == 'admin' && <option value='admin'>Admin</option>}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="userManager" className="form-label">Felettes</label>
              <select className="form-select" id="userManager" value={userManager} onChange={(e) => setUserManager(e.target.value)}>
                <option value=''>Válasszon...</option>
                {user?.prefs?.role == 'irodavezeto' && <option value={user.$id}>{user.name}</option>}
                {user?.prefs?.role == 'admin' && data.map((u) => {
                  if (u.prefs?.role == 'irodavezeto' || u.prefs?.role == 'jegyzo' || u.prefs?.role == 'admin') {
                    return (
                      <option key={u.$id} value={u.$id}>{u.name}</option>
                    );
                  } else {
                    return null;
                  }
                })}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={theme} onClick={() => handleCreateUserClose()}>
            Bezárás
          </Button>
          <Button variant="success" onClick={handleSubmitCreate}>
            Mentés
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={errorCode} />
        <SuccessToast success={success} setSuccess={setSuccess} title="Létrehozva" text={`Felhasználó sikeresen létrehozva.`} />
      </ToastContainer>

      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          handleUpdate();
        }}>Frissítés</Button>
        {user?.prefs?.perms?.includes('jegyzo.create_user') && (
          <Button type='button' className='btn-primary mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
            e.preventDefault();
            createUser();
          }}>
            Új felhasználó
          </Button>
        )}
        {(user?.prefs?.perms?.includes('hr.edit_user_current_state') && new Date().getMonth() == 0) && (
          <Button type='button' className='btn-danger mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Biztos szeretné az összes felhasználó szabadság tervét törölni?")) deletePlan('reset');
          }}>Szabadság tervek törlése</Button>
        )}
      </div>
      <Table className={theme == "dark" ? 'table-dark table-striped mt-2 shadow-dark' : 'table-striped mt-2 shadow-light'}>
        <thead>
          <tr>
            <th style={{ maxWidth: "3%", width: "3%" }}>#</th>
            <th style={{ maxWidth: "30%", width: "30%" }}>Név</th>
            <th style={{ maxWidth: "30%", width: "30%" }}>Felhasználónév</th>
            <th style={{ maxWidth: "36%", width: "36%" }}>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u, index) => (
            <tr key={u.$id + index} className={`${u.prefs.sick 
                                                ? 'table-danger' 
                                                : u.prefs.onLeave 
                                                ? 'table-warning' 
                                                : (u.prefs.manager == user.$id && user.prefs.perms.includes("jegyzo.list_all")) 
                                                ? 'table-secondary' 
                                                : ''}`}>
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <Button type='button' className='btn-primary my-1 mx-1 shadow-smc' onClick={(e) => {
                  e.preventDefault();
                  handleView(u.$id, u.name);
                }}>
                  Naptár
                </Button>
                {user?.prefs?.perms?.includes('irodavezeto.message_send') && (
                  <Button type='button' className='btn-success my-1 mx-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    sendMessage(u.$id);
                  }}>Üzenet küzdés</Button>
                )}
                {user?.prefs?.perms?.includes('jegyzo.edit_user') && (
                  <Button type='button' className='btn-warning my-1 mx-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    editUser(u.$id);
                  }}>Szerkesztés</Button>
                )}
                {(user?.prefs?.perms?.includes('hr.edit_user_current_state') || user?.prefs?.perms?.includes('jegyzo.delete_user')) && (
                  <ButtonGroup aria-label='törlés' className='my-1 mx-1 shadow-smc'>
                    <a href='#' role='button' className='btn btn-danger btn-xs' id='label-btn' aria-disabled='true'>Törlés</a>
                    {user?.prefs?.perms?.includes('hr.edit_user_current_state') && (
                      <Button type='button' className='btn-danger btn-border-left' onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm("A törléssel a teljes éves szabadság terv törlésre kerül a felhasználó számára!\nBiztos szeretné a felhasználó szabadság tervét törölni?")) deletePlan(u.$id);
                      }}>Terv</Button>
                    )}
                    {user?.prefs?.perms?.includes('jegyzo.delete_user') && (
                      <Button type='button' className='btn-danger btn-border-left' onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm("Biztos szeretné a felhasználót törölni?")) deleteUser(u.$id);
                      }}>Felhasználó</Button>
                    )}
                  </ButtonGroup>
                )}
                {user?.prefs?.perms?.includes('hr.edit_user_perms') && (
                  <Button type='button' className='btn-info my-1 mx-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    async function copyToClipboard(text) {
                      if ('clipboard' in navigator) {
                        return await navigator.clipboard.writeText(text);
                      } else {
                        return document.execCommand('copy', true, text);
                      }
                    }
                    copyToClipboard(u.$id);
                  }}></Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default UsersList