import { motion } from 'framer-motion';

const ReceiverIcon = ({ children, recipient }) => {

    return (
        <div className='active-recipient'>
            {children}
            <motion.h4
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              {recipient.id.slice(0, 5)}
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