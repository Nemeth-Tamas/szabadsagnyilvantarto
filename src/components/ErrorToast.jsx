import React from 'react'
import { Toast, ToastBody, ToastHeader } from 'react-bootstrap'

const ErrorToast = ({ error, setError, text }) => {
  return (
    <Toast show={error} onClose={() => setError(false)} delay={3000} autohide animation={true} className='bg-danger text-white' >
      <ToastHeader>
        <strong className="me-auto">Hiba</strong>
      </ToastHeader>
      <ToastBody>
        {text}
      </ToastBody>
    </Toast>
  )
}

export default ErrorToast