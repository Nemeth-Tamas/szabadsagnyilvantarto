import React from 'react'
import { Toast, ToastBody, ToastHeader } from 'react-bootstrap'

const SuccessToast = ({ success, setSuccess, title, text }) => {
  return (
    <Toast show={success} onClose={() => setSuccess(false)} delay={3000} autohide animation={true} className='bg-success text-white' >
      <ToastHeader>
        <strong className="me-auto">{title}</strong>
      </ToastHeader>
      <ToastBody>
        {text}
      </ToastBody>
    </Toast>
  )
}

export default SuccessToast