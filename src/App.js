import './App.css';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recipient from './Components/Recipient';

const socket = io.connect('localhost:8080');

const App = () => {
	const [nearby, setNearby] = useState([]);
	const selfRef = useRef('');
	const otherRef = useRef('');
	const peerRef = useRef();

	const onConnectRTC = (callee) => {

		console.log('initiate call')
		otherRef.current = callee;
		peerRef.current = createPeer(callee);
		peerRef.current.onicecandidate = (e) => {
			console.log('create ice')
			if (e.candidate) {
				const payload = {
					target: otherRef.current,
					candidate: e.candidate,
				}
				socket.emit("ice-candidate", payload);
			}
		}
		handleNegotiationNeededEvent(callee);
	}

	const createPeer = (sessionID) => {
		console.log('making a new peer')
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
				},
			],
			iceCandidatePoolSize: 10,
		});

		return peer;
	}

	const handleNegotiationNeededEvent = async (calleeID) => {
		try {
			const offerDesc = await peerRef.current.createOffer();
			await peerRef.current.setLocalDescription(offerDesc);

			const payload = {
				callee: calleeID,
				caller: selfRef.current,
				sdp: peerRef.current.localDescription
			}
			await socket.emit('offer-connection', payload);
			console.log('offer sent')
		} catch (e) {
			console.log(e);
		}
	}

	const handleReceive = async (incoming) => {
		console.log('received offer')

		peerRef.current = createPeer();
		peerRef.current.onicecandidate = (e) => {
			console.log('create ice')
			if (e.candidate) {
				const payload = {
					target: otherRef.current,
					candidate: e.candidate,
				}
				socket.emit("ice-candidate", payload);
			}
		}
		otherRef.current = incoming.caller;
		const desc = new RTCSessionDescription(incoming.sdp);
		await peerRef.current.setRemoteDescription(desc);
		const answer = await peerRef.current.createAnswer();
		await peerRef.current.setLocalDescription(answer);

		const payload = {
			callee: otherRef.current,
			caller: selfRef.current,
			sdp: peerRef.current.localDescription
		}

		console.log('answer sent')
		await socket.emit('answer-connection', payload);
	}

	const handleAnswer = async (incoming) => {
		console.log('answer logged')

		const desc = new RTCSessionDescription(incoming.sdp);

		try {
			await peerRef.current.setRemoteDescription(desc)
		} catch (e) {
			console.log(e);
		}
	}

	const handleNewICECandidate = async (incoming) => {
		console.log('got new ice candidate')
		const candidate = new RTCIceCandidate(incoming);

		peerRef.current.addIceCandidate(incoming);

		try {
			await peerRef.current.addIceCandidate(candidate)
		} catch (e) {
			console.log(e);
		}
	}

	socket.off('offer-connection').on('offer-connection', handleReceive);

	socket.off('answer-connection').on('answer-connection', handleAnswer);

	socket.off('ice-candidate').on('ice-candidate', handleNewICECandidate);


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

	// console.log(nearby);
	// console.log('length', nearby.length)

	return (
		<div className="App">
			<div className="recipient-container">
				{nearby.filter((value) => value.id !== selfRef.current).map((value, key) => {
					return ( <div key={key}>
						<Recipient 
						recipient={value} 
						idx={key} 
						recipientCount={nearby.length} 
						upload={uploadFile} 
						connectRTC={onConnectRTC}
						/></div> )
				})}
			</div>
			<div className="footer-container">
				<p>You are known as: {selfRef.current.slice(0, 5)}</p>
			</div>
		</div>
	);
}

export default App;
