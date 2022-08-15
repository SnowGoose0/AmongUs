import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import MessagePrompt from '../MessagePrompt/index';
import './index.css';

const Avatar = ({ send, recipient, avatar64, sendFile, prog }) => {
    const [messagePrompt, setMessagePrompt] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState();

    const selectFile = (e) => {
		if (e.target.files[0]) {
			setFile(e.target.files[0]);
			console.log(e.target.files[0].size)
		}
	}
    
    const {getRootProps, getInputProps} = useDropzone({
        onDrop: (acceptedFiles) => {
            sendFile(recipient.id, acceptedFiles[0]);
        },

        disabled: (progress > 0 && progress < 1) ? true : false,

        maxFiles: 1,
    });

    useEffect(() => {
        if (file) {
            sendFile(recipient.id, file)
        }
        console.log(file);
    }, [file])

    useEffect(() => {
        if (prog === 1) {
            setTimeout(() => {
                setProgress(1.1)
            }, 500);
        }

        setProgress(prog)
    }, [prog]);

    const progressGradient = {
        background: `conic-gradient(rgb(53, 181, 231) ${progress * 100}%, transparent 0%)`,
    }

    const handleMessagePrompt = (e) => {
        e.preventDefault();
        setMessagePrompt(state => !state);
    }
    
    return (
        <div>
            <div onContextMenu={(e) => handleMessagePrompt(e)} className='client-container'>
                <motion.div
                    style={progressGradient}
                    className={(progress === 1.1 || Math.floor(progress * 100) === 0) ? 'progress hidden' : 'progress'}
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
                    <motion.div 
                        className='avatar-container blend-background'
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        <motion.img 
                            title={recipient.id.slice(0, 5)}
                            src={avatar64}
                            className='recipient-icon-motion'
                            initial={{ scale: 0 }}
                            animate={{ rotate: 360, scale: 1}}
                            transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                            }}
                        >
                        </motion.img>
                    </motion.div>
                </motion.div>
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