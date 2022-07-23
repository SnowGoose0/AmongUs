import './App.css';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import ReceiverIcon from './Components/ReceiverIcon';

const socket = io.connect('localhost:8080');

const App = () => {

	const [nearby, setNearby] = useState([]);

	useEffect(() => {
		const connectUser = async () => {
			const res = await axios.get('https://api.ipify.org/?format=json');
			const IP = await res.data.ip;
			const OS = navigator.userAgentData.platform;
			await socket.emit('connect-ip', {
				ip: IP,
				os: OS,
			});
		}
		connectUser();
	}, [])

	socket.on('nearby-users', (nearbyUsers) => {
		setNearby(nearbyUsers);
	})

	console.log(nearby);
	console.log('length', nearby.length)

	return (
		<div className="App">
			<div className="users-container">
				{nearby.map((value, key) => {
					return (
						<ReceiverIcon sessionID={value} key={key}/>
					)
				})}
			</div>
		</div>
	);
}

export default App;
