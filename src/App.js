import './App.css';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recipient from './Components/Recipient';

const socket = io.connect('localhost:8080');

const App = () => {
	const [self, setSelf] = useState('');
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

	socket.on('get-self', (self) => {
		setSelf(self);
	})

	socket.on('nearby-users', (nearbyUsers) => {
		setNearby(nearbyUsers);
	})

	const uploadFile = (file) => {
		socket.emit('upload-file', file);
	}

	console.log(nearby);
	console.log('length', nearby.length)

	return (
		<div className="App">
			<div className="recipient-container">
				{nearby.filter((value) => value.id !== self).map((value, key) => {
					return ( <Recipient recipient={value} idx={key} recipientCount={nearby.length} upload={uploadFile}/> )
				})}
			</div>
			<div className="footer-container">
				<p>You are known as: {self.slice(0, 5)}</p>
			</div>
		</div>
	);
}

export default App;
