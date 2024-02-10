import React, { useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap';

const PasswordField = ({password, setPassword, id}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputGroup className='mb-3'>
      <FormControl
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
        id={id}
      />
      <Button
        variant='outline-secondary'
        onClick={handleTogglePassword}
        tabIndex="-1"
      >
        {showPassword ? 'Hide' : 'Show'}
      </Button>
    </InputGroup>
  )
}

export default PasswordField