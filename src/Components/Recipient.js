import { useState, useEffect ,useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MessagePrompt from './MessagePrompt'
import recipientIcon from '../Assets/among-tmp.jpg';

const ReceiverIcon = (props) => {
  const [messagePrompt, setMessagePrompt] = useState(false);
  const chooseFile = useRef()

  const handleMessagePrompt = (e) => {
    // props.connectRTC(props.recipient.id);
    e.preventDefault();
    setMessagePrompt(state => !state);
  }

  const submitFile = (e, file) => {
  }

  return (
    <div className='active-recipient'>
        <input type="file" ref={chooseFile} className='hidden' onChange={(e) => {
          submitFile(e, e.target.files[0])
        }}/>
        <div onClick={() => {chooseFile.current.click()}} onContextMenu={(e) => handleMessagePrompt(e)}>
          <motion.img 
            src={recipientIcon}
            className='recipient-icon-motion'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ rotate: 360, scale: 1}}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
          </motion.img>
        </div>

          <motion.h4
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
          >
            {props.recipient.id.slice(0, 5)}
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            onClick={() => {
              props.connectRTC(props.recipient.id);
            }}
          >
            {props.recipient.os}
          </motion.p>

          <AnimatePresence
            initial={false}
            exitBeforeEnter={true}
            onExitComplete={() => null}
          >
            {messagePrompt && <MessagePrompt handleClose={handleMessagePrompt} send={props.send} calleeID={props.recipient.id}/>}
          </AnimatePresence>

    </div>
  )
}

export default ReceiverIcon