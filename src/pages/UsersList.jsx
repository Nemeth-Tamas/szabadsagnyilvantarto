import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from '../store/userSlice';
import { useNavigate } from 'react-router';
import { Button, ButtonGroup, Modal, Spinner, Table, ToastContainer } from 'react-bootstrap';
import { ModalCalendar, SuccessToast, ErrorCodes, BetterErrorToast, LoadingCircle } from '../components';
import api from '../api';

const UsersList = () => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(ErrorCodes.UnknownError);
  const devmode = import.meta.env.VITE_DEVMODE;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
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
    if (!token || !user.role == 'admin') {
      navigate('/login');
    }
    handleUpdate();
    // handleView(user.id);
  }, []);

  const handleUpdate = () => {
    setErrorCode(ErrorCodes.FailedToLoadUsers);
    api.request({
      method: 'GET',
      url: `/users`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        if (response.status != 200) setError(true);
        console.log(response);
        setData(response.data);
        setLoadingUsers(false);
      })
      .catch((error) => {
        console.log(error);
        setError(true);
      });
  };
  // TODO: Everywhere change setError to return
  const handleView = (id, name) => {
    setErrorCode(ErrorCodes.FailedToLoadSzabadsag);
    api.request({
      method: 'GET',
      url: `/leaves/${id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      setUserCalendarData(response.data);
      setUidForDownload(id);
      setUnameForDownload(name)

      // get user max and left days
      setErrorCode(ErrorCodes.FailedToLoadUser);
      api.request({
        method: 'GET',
        url: `/user/${id}`,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((response) => {
        if (response.status != 200) setError(true);
        console.log(response);
        setUserCalendarStats(response.data);
        // get sick days
        const options = {
          method: 'GET',
          url: `/tappenz/cumulative/${id}`,
          headers: {
            'Content-Type': 'application/json',
          }
        }

        api.request(options).then((response) => {
          if (response.status != 200) { setError(true); return; }

          setTappenz(response.data);
          setLoading(false);
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
    api.request({
      method: 'DELETE',
      url: `/user/${id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      console.log(response);
      handleUpdate();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const deletePlan = (id) => {
    setErrorCode(ErrorCodes.ErrorWhileDeletingSignlePlan)
    api.request({
      method: 'DELETE',
      url: `/plans/${id}`,
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      console.log(response);
      handleUpdate();
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const createUser = () => {
    setShowCreateUser(true);
  };

  function generateRandomSequence() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  const createRandomUser = () => {
    let random = generateRandomSequence();
    let postUserEmail = random + '@celldomolk.hivatal';
    let postUserPassword = "";
    let postUserUsername = random;
    let postUserRole = 'felhasznalo';
    let postUserManager = user.id;
    let postUserMaxdays = 30;
    let postUserDaysLeft = -1;

    postUserDaysLeft = postUserMaxdays;
    setLoadingUsers(true);

    postUserPassword = random;

    api.request({
      method: 'POST',
      url: `/register`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: postUserEmail,
        password: postUserPassword,
        name: postUserUsername,
        role: postUserRole,
        managerId: postUserManager,
        maxDays: postUserMaxdays,
        remainingDays: postUserDaysLeft
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      console.log(response);
      handleUpdate();
      setSuccess(true);
    }).catch((error) => {
      console.log(error);
      setError(true);
    });
  };

  const handleSubmitCreate = () => {
    let postUserEmail = userEmail.toLowerCase().trim();
    let postUserPassword = "";
    let postUserUsername = userUsername;
    let postUserRole = userRole;
    let postUserManager = userManager;
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

    postUserPassword = userPassword;

    if (postUserEmail == '' || postUserPassword == '' || postUserUsername == '' || postUserRole == '' || postUserManager == '' || postUserMaxdays < 0 || postUserDaysLeft < -1) {
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
    setLoadingUsers(true);
    setErrorCode(ErrorCodes.FailedToRegisterUser);
      api.request({
        method: 'POST',
        url: `/register`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: postUserEmail,
          password: postUserPassword,
          name: postUserUsername,
          role: postUserRole,
          managerId: postUserManager,
          maxDays: postUserMaxdays,
          remainingDays: postUserDaysLeft
        }
      }).then((response) => {
        if (response.status != 200) setError(true);
        console.log(response);
        handleUpdate();
        handleCreateUserClose();
        setSuccess(true);
      }).catch((error) => {
        console.log(error);
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
    api.request({
      method: 'POST',
      url: `/messages`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: postUserId,
        message: postMessageContent,
        date: postMessageDate
      }
    }).then((response) => {
      if (response.status != 200) setError(true);
      console.log(response);
      handleUpdate();
      setSendLoading(false);
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
      url: `/plans/${uid}/excel`,
      responseType: 'blob'
    }

    api.request(options).then((response) => {
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
      setLoadingDownload(false);
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
          <Button variant={theme} onClick={(e) => {
            e.preventDefault();
            setLoadingDownload(true);
            handleDownload(e, uidForDownload)
          }}>
            {loadingDownload && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
            Terv letöltése
          </Button>
          <Button variant={theme} onClick={() => handleCalendarClose()}>
            Bezárás
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal variant={theme} show={loading} centered>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Modal.Body>
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
          <Button variant="success" onClick={(e) => {
              e.preventDefault();
              setSendLoading(true);
              handleSubmitMessage()
            }}>
              {sendLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Küldés...
                </>
              ) : (
                <>
                  Mentés
                </>
              )}
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
            {user?.role == 'admin' && (
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
                {user?.role == 'admin' && <option value='jegyzo'>Jegyző</option>}
                {user?.role == 'admin' && <option value='admin'>Admin</option>}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="userManager" className="form-label">Felettes</label>
              <select className="form-select" id="userManager" value={userManager} onChange={(e) => setUserManager(e.target.value)}>
                <option value=''>Válasszon...</option>
                {user?.role == 'irodavezeto' && <option value={user.id}>{user.name}</option>}
                {user?.role == 'admin' && data.map((u) => {
                  if (u.role == 'irodavezeto' || u.role == 'jegyzo' || u.role == 'admin') {
                    return (
                      <option key={u.id} value={u.id}>{u.name}</option>
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

      <ToastContainer className='p-3' position='top-end' style={{ zIndex: 9999 }} >
        <BetterErrorToast error={error} setError={setError} errorText={errorCode} />
        <SuccessToast success={success} setSuccess={setSuccess} title="Létrehozva" text={`Felhasználó sikeresen létrehozva.`} />
      </ToastContainer>

      <div className='w-100 d-flex'>
        <Button type='button' className='btn-success mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
          e.preventDefault();
          setLoadingUsers(true);
          handleUpdate();
        }}>Frissítés</Button>
        {(user?.role != "felhasznalo" || user?.role != "irodavezeto") && (
          <Button type='button' className='btn-primary mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
            e.preventDefault();
            createUser();
          }}>
            Új felhasználó
          </Button>
        )}
        {devmode && (
          <Button type='button' className='btn-primary mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
            e.preventDefault();
            createRandomUser();
          }}>
            Generate Radnom User
          </Button>
        )}
        {(user?.role == "admin" && new Date().getMonth() == 2) && (
          <Button type='button' className='btn-danger mt-2 flex-grow-1 mx-1 shadow-smc' onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Biztos szeretné az összes felhasználó szabadság tervét törölni?")) deletePlan('all');
          }}>Szabadság tervek törlése</Button>
        )}
      </div>
      {loadingUsers && (
        <div className='d-flex justify-content-center'>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      { !loadingUsers && (
        <Table className={theme == "dark" ? 'table-dark mt-2 shadow-dark' : 'mt-2 shadow-light'}>
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
              <tr key={u.id + index} className={`${u.sick 
                                                  ? 'table-danger' 
                                                  : u.onLeave 
                                                  ? 'table-warning' 
                                                  : (u.managerId == user.id && (user.role == 'jegyzo' || user.role == 'admin')) 
                                                  ? 'table-secondary' 
                                                  : ''}`}>
                <td>{index + 1}</td>
                <td>{u.name} [{u.role == "admin" ? "A" : u.role == "jegyzo" ? "J" : u.role == "irodavezeto" ? "I" : "F"}]</td>
                <td>{u.email}</td>
                <td>
                  <Button type='button' className='btn-primary my-1 mx-1 shadow-smc' onClick={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    handleView(u.id, u.name);
                  }}>
                    Naptár
                  </Button>
                  {user?.role != "felhasznalo" && (
                    <Button type='button' className='btn-success my-1 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      sendMessage(u.id);
                    }}>Üzenet küzdés</Button>
                  )}
                  {(user?.role == "jegyzo" || user?.role == "admin") && (
                    <Button type='button' className='btn-warning my-1 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      editUser(u.id);
                    }}>Szerkesztés</Button>
                  )}
                  {(user?.role == "admin" || user?.role == "jegyzo") && (
                    <ButtonGroup aria-label='törlés' className='my-1 mx-1 shadow-smc'>
                      <a href='#' role='button' className='btn btn-danger btn-xs' id='label-btn' aria-disabled='true'>Törlés</a>
                      {user?.role == "admin" && (
                        <Button type='button' className='btn-danger btn-border-left' onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm("A törléssel a teljes éves szabadság terv törlésre kerül a felhasználó számára!\nBiztos szeretné a felhasználó szabadság tervét törölni?")) deletePlan(u.id);
                        }}>Terv</Button>
                      )}
                      {(user?.role == "jegyzo" || user?.role == "admin") && (
                        <Button type='button' className='btn-danger btn-border-left' onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm("Biztos szeretné a felhasználót törölni?")) {
                            setLoadingUsers(true);
                            deleteUser(u.id);
                          }
                        }}>Felhasználó</Button>
                      )}
                    </ButtonGroup>
                  )}
                  {/* {user?.prefs?.perms?.includes('hr.edit_user_perms') && (
                    <Button type='button' className='btn-info my-1 mx-1 shadow-smc' onClick={(e) => {
                      e.preventDefault();
                      async function copyToClipboard(text) {
                        if ('clipboard' in navigator) {
                          return await navigator.clipboard.writeText(text);
                        } else {
                          return document.execCommand('copy', true, text);
                        }
                      }
                      copyToClipboard(u.id);
                    }}></Button>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default UsersList