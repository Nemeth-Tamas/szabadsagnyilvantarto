import React from 'react'
import { Toast, ToastBody, ToastHeader } from 'react-bootstrap'
import ErrorCodes from './ErrorCodes'

const BetterErrorToast = ({ error, setError, errorText }) => {
  return (
    <Toast show={error} onClose={() => setError(false)} delay={3000} autohide animation={true} className='bg-danger text-white' >
      <ToastHeader>
        <strong className="me-auto">Hiba</strong>
      </ToastHeader>
      <ToastBody>
        {errorText}
      </ToastBody>
    </Toast>
  )
}

export default BetterErrorToast