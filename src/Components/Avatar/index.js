import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MessagePrompt from '../MessagePrompt/index'
import './index.css'

const Avatar = ({ send, recipient, avatar64 }) => {
    const [messagePrompt, setMessagePrompt] = useState(false);
    const chooseFile = useRef();

    const handleMessagePrompt = (e) => {
        e.preventDefault();
        setMessagePrompt(state => !state);
    }

    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => {
          const delay = 1 + i * 0.5;
          return {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
              opacity: { delay, duration: 0.01 }
            }
          };
        }
      };

    return (
        <div>
            <input type="file" ref={chooseFile} className='hidden' onChange={() => {console.log('file submitted')}}/>
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