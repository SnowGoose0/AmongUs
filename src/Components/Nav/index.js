import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const Nav = ({ setMenuOpen, img, delayCustom, showIcon }) => {

    return (
        <div className='empty'>
            <AnimatePresence>
                {showIcon && (
                    <motion.div 
                        className='nav-container'
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                            delay: delayCustom,
                            ease: 'easeInOut',
                            duration: 1,
                        }}
                    >
                        <motion.img
                            className='icon info'
                            onClick={ () => { setMenuOpen(state => !state)} }
                            src={img}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                        </motion.img>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    )
}

export default Nav