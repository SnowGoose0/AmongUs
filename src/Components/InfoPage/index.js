import { motion, AnimatePresence } from 'framer-motion'
import Nav from '../Nav/index';
import './index.css'
import closeIcon from '../../Assets/close.png';

const InfoPage = ({ menuOpen, setMenuOpen }) => {

    return (
        <AnimatePresence>
            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}

                    transition = {{ duration: 1 }}
                >
                    <motion.div className='info-page'>
                        {menuOpen && (
                            <AnimatePresence>
                                <motion.div 
                                    className='container'
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: .1 }}
                                >
                                    <Nav 
                                        setMenuOpen={setMenuOpen} 
                                        img={closeIcon} 
                                        delayCustom={1}
                                        showIcon={menuOpen}
                                    />

                                    <div className='info-box-container'>
                                        <motion.div
                                            className='info-box'
                                        >
                                            <motion.h2>Hello World</motion.h2>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

    )
}

export default InfoPage