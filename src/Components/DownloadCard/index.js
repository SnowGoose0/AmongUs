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
            duration: 0.1,
            type: 'spring',
            damping: 25,
            stiffness: 500,
        }
    },
    exit: {
        y: '100vh',
        opacity: 0,
    },
};

const DownloadCard = ({ handleClose, value, download }) => {

    return (
        <Backdrop onClick={handleClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className='modal message-card'
                variants={dropIn}
                initial='hidden'
                animate='visible'
                exit='exit'
            >   
                <motion.h1>Message Received</motion.h1>
                <motion.div className='received-message'>
                    <motion.p>{value}</motion.p>
                </motion.div>
                <motion.div className='message-card-buttons'>
                    <motion.button onClick={handleClose} className='button message-card-close'>CLOSE</motion.button>
                    <motion.button onClick={(e) => {
                        download()
                        handleClose(e)
                    }} className='button message-card-copy'>DOWNLOAD</motion.button>
                </motion.div>
            </motion.div>
        </Backdrop>
  )
}

export default DownloadCard