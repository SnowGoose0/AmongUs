import Particles from 'react-tsparticles';
import { loadFull } from "tsparticles";
import particlesConfig from './config/particles-config';
import './index.css';

const ParticlesBackground = () => {

    const particlesInit = async (main) => {
        await loadFull(main);
    }

    const particlesLoaded = (container) => {
    }

    return (
        <Particles 
            id='tsparticles'
            init={particlesInit}
            loaded={particlesLoaded}
            options={particlesConfig}>
        </Particles>
    )
}

export default ParticlesBackground