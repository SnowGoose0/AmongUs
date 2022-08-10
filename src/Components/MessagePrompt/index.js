import { useState } from 'react'
import { motion } from 'framer-motion';
import './index.css';
import Backdrop from '../Backdrop/index.js';

const dropIn = {
    hidden: {
        y: '-100vh',
        opacity: 0,
    },
    visible: {
        y: '0',
        opacity: 1,
        transition: {
            duration: 1,
            type: 'spring',
            damping: 25,
            stiffness: 400,
        }
    },
    exit: {
        y: '100vh',
        opacity: 0,
    },
};

const MessagePrompt = ({ handleClose, send, calleeID }) => {
    const [input, setInput] = useState('');

    return (
        <Backdrop onClick={handleClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className='modal message-prompt'
                variants={dropIn}
                initial='hidden'
                animate='visible'
                exit='exit'
            >   
                <motion.h1>Send a Message</motion.h1>
                <motion.div className='text-field-container'>
                    <motion.form>
                        <motion.input type='text' placeholder='Enter a message' className='text-field input-prompt' onChange={(e) => setInput(e.target.value)}></motion.input>
                    </motion.form>
                </motion.div>
                <motion.div className='message-prompt-buttons'>
                    <motion.button onClick={handleClose} className='button message-prompt-close'>CANCEL</motion.button>
                    <motion.button onClick={() => {
                        send(input, calleeID)
                        setInput('')
                    }} className='button message-prompt-send'>SEND</motion.button>
                </motion.div>
            </motion.div>
        </Backdrop>
  )
}

export default MessagePrompt