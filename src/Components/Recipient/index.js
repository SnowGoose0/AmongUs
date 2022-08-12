import { motion } from 'framer-motion';
import './index.css'

const ReceiverIcon = ({ children, recipient, alias }) => {

    return (
        <div className='active-recipient'>
            {children}
            <motion.h4
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              {alias}
            </motion.h4>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              {recipient.os}
            </motion.p>
        </div>
    )
}

export default ReceiverIcon