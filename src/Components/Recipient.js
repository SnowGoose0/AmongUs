import { useState, useEffect ,useRef } from 'react';
import { motion } from 'framer-motion';
import recipientIcon from '../Assets/among-tmp.jpg';

const getWindowSize = () => {
  const {innerWidth, innerHeight} = window;
  return {innerWidth, innerHeight};
}

const ReceiverIcon = (props) => {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  const chooseFile = useRef()

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  console.log(windowSize)

  const submitFile = (e, file) => {
    e.preventDefault();
    props.upload(file);
    console.log(`uploaded to ${props.recipient.id}`);
  }

  return (
    <div className='active-recipient'>
        <input type="file" ref={chooseFile} className='hidden' onChange={(e) => {
          submitFile(e, e.target.files[0])
        }}/>
        <div onClick={() => { 
          chooseFile.current.click();
          props.sessionID.current = props.recipient.id;
          props.connectRTC();
        }}>
          <motion.img 
            src={recipientIcon}
            className = 'recipient-icon-motion'
            whileHover = {{ scale: 1.1 }}
            whileTap = {{ scale: 0.95 }}
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
          >
            {props.recipient.os}
          </motion.p>
    </div>
  )
}

export default ReceiverIcon