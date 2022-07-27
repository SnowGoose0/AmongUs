import './App.css';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recipient from './Components/Recipient';

const socket = io.connect('localhost:8080');

const App = () => {
	const [nearby, setNearby] = useState([]);
	const selfRef = useRef();
	const calleeRef = useRef();
	const peerRef = useRef();

	const onConnectRTC = async () => {
		peerRef.current = createPeer(selfRef.current);
	}

	socket.on('offer-connection', handleReceive);

	socket.on('answer-connection', handleAnswer);

	socket.on('ice-candidate', handleNewICECandidate);

	const createPeer = (sessionID) => {
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
				},
			],
			iceCandidatePoolSize: 10,
		});

		peer.onicecandidate = handleICECandidateEvent;
		peer.onnegotiationneeded = () => {
			handleNegotiationNeededEvent(sessionID);
		}

		return peer;
	}

	const handleNegotiationNeededEvent = async () => {
		try {
			const offer = await peerRef.current.createOffer();
			await peerRef.current.setLocalDescription(offer);

			const payload = {
				callee: calleeRef.current,
				caller: selfRef.current,
				sdp: peerRef.current.localDescription
			}

			await socket.emit('offer-connection', payload);
		} catch (e) {
			console.log(e);
		}
	}

	const handleReceive = async (incoming) => {
		peerRef.current = createPeer();
		const desc = new RTCSessionDescription(incoming.sdp);
		await peerRef.current.setRemoteDescription(desc);
		const answer = await peerRef.current.createAnswer();
		await peerRef.setLocalDescription(answer);

		const payload = {
			callee: calleeRef.current,
			caller: selfRef.current,
			sdp: peerRef.current.localDescription
		}

		await socket.emit('answer-connection', payload);
	}

	const handleAnswer = async (incoming) => {
		const desc = new RTCSessionDescription(incoming.sdp);
		try {
			await peerRef.current.setRemoteDescription(desc)
		} catch (e) {
			console.log(e);
		}
	}

	const handleICECandidateEvent = (e) => {
		if (e.candidate) {
			const payload = {
				callee: calleeRef.current,
				candidate: e.candidate,
			}
			socket.emit('ice-candidate', payload);
		}
	}

	const handleNewICECandidate = async (incoming) => {
		const candidate = new RTCIceCandidate(incoming);

		peerRef.current.addIceCandidate(incoming);

		try {
			await peerRef.current.addIceCandidate(candidate)
		} catch (e) {
			console.log(e);
		}
	}


	useEffect(() => {
		const findNearbyUsers = async () => {
			const res = await axios.get('https://api.ipify.org/?format=json');
			const IP = await res.data.ip;
			const OS = navigator.userAgentData.platform;
			await socket.emit('connect-ip', {
				ip: IP,
				os: OS,
			});
		}
		findNearbyUsers();
	}, [])

	socket.on('get-self', (currentSelf) => {
		selfRef.current = currentSelf;
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
				{nearby.filter((value) => value.id !== selfRef.current).map((value, key) => {
					return ( <Recipient recipient={value} 
										idx={key} 
										recipientCount={nearby.length} 
										upload={uploadFile} 
										sessionID={calleeRef}
										connectRTC={onConnectRTC}
										/> )
				})}
			</div>
			<div className="footer-container">
				<p>You are known as: {selfRef.current.slice(0, 5)}</p>
			</div>
		</div>
	);
}

export default App;
