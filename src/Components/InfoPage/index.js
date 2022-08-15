import { motion, AnimatePresence } from 'framer-motion'
import Nav from '../Nav/index';
import './index.css'
import closeIcon from '../../Assets/close.png';
import githubIcon from '../../Assets/github.png';

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
                                            <motion.a
                                                href='https://github.com/SnowGoose0/AmongUs-Client'
                                                target='_blank'
                                            >
                                                <motion.img
                                                    className='icon github'
                                                    src={githubIcon}
                                                    alt='Github link'
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: .5, type: 'spring', duration: 1, bounce: 0.25 }}
                                                />
                                            </motion.a>
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