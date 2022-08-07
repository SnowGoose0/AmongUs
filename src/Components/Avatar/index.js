import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MessagePrompt from '../MessagePrompt/index'
import './index.css'

const Avatar = ({ send, recipient, avatar64, sendFile, selectFile }) => {
    const [messagePrompt, setMessagePrompt] = useState(false);
    const chooseFile = useRef();

    const handleMessagePrompt = (e) => {
        e.preventDefault();
        setMessagePrompt(state => !state);
    }
    

    return (
        <div>
            <input type="file" ref={chooseFile} className='hidden' onChange={selectFile}/>
            <div onClick={() => {chooseFile.current.click()}} onContextMenu={(e) => handleMessagePrompt(e)}>
                <motion.img 
                    src={avatar64}
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
            <div>
                <button onClick={() => {sendFile(recipient.id)}}> Send File</button>
            </div>
            <div>
                <AnimatePresence
                initial={false}
                exitBeforeEnter={true}
                onExitComplete={() => null}
                >
                {messagePrompt && <MessagePrompt handleClose={handleMessagePrompt} send={send} calleeID={recipient.id}/>}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Avatar