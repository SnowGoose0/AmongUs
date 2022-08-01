import './App.css';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Recipient from './Components/Recipient';

const socket = io.connect('localhost:8080');

const App = () => {

	// const [connection, setConnection] = useState({connection: false, peerID: 'NONE'})
	const [connections, setConnections] = useState({});

	const [nearby, setNearby] = useState([]);

	const selfRef = useRef('');
	const otherRef = useRef('');
	const peerRef = useRef({});
	const channelRef = useRef();

	const onConnectRTC = (calleeID) => {
		console.log('rtc triggered')
		peerRef.current = createPeer(calleeID);
		channelRef.current = peerRef.current.createDataChannel('main');
		channelRef.current.onmessage = handleReceiveMessage;
		channelRef.current.onclose = () => handleChannelClose(calleeID);

		setConnections({...connections, [calleeID]: {
			rtc: peerRef.current,
			channel: channelRef.current,
		}})
	}

	const handleReceiveMessage = (e) => {
		// setMessages(messages => [...messages, {yours: false, value: e.data}])
		console.log(e.data)
	}

	const createPeer = (calleeID) => {
		otherRef.current = calleeID;
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
				},
			],
			iceCandidatePoolSize: 10,
		});

		console.log('created peer')
		
		peer.onsignalingstatechange = signalEvent;
		peer.onicecandidate = iceEvent;
		peer.onnegotiationneeded = () => negotiationEvent(calleeID);

		return peer;
	}

	const negotiationEvent = async (calleeID) => {
		console.log('negotiating')
		const offer = await peerRef.current.createOffer();
		await peerRef.current.setLocalDescription(offer);

		const payload = {
			callee: calleeID,
			caller: selfRef.current,
			sdp: peerRef.current.localDescription,
		};
		socket.emit('offer-connection', payload);
	}

	const handleOffer = async (offer) => {
		console.log('offer received')
		peerRef.current = createPeer();
		
		otherRef.current = offer.caller;

		peerRef.current.ondatachannel = (e) => {
			channelRef.current = e.channel;
			channelRef.current.onmessage =  handleReceiveMessage;

			setConnections({...connections, [offer.caller]: {
				rtc: peerRef.current,
				channel: channelRef.current,
			}})
		}

		const desc = new RTCSessionDescription(offer.sdp);
		await peerRef.current.setRemoteDescription(desc);
		
		const ans = await peerRef.current.createAnswer();

		await peerRef.current.setLocalDescription(ans);

		const payload = {
			callee: offer.caller,
			caller: selfRef.current,
			sdp: peerRef.current.localDescription,
		}
		socket.emit('answer-connection', payload);
	}

	const handleAnswer = async (answer) => {
		console.log('answer received')
		const desc = new RTCSessionDescription(answer.sdp);
		await peerRef.current.setRemoteDescription(desc);
	}

	const iceEvent = (e) => {
		if (e.candidate) {
			console.log('ice sent')
			const payload = {
				callee: otherRef.current,
				candidate: e.candidate,
			}
			socket.emit('ice-candidate', payload);
		}
	}

	const newIceCandidate = async (incoming) => {
		console.log('ice received')
		const candidate = new RTCIceCandidate(incoming);
		try {
			await peerRef.current.addIceCandidate(candidate);
		} catch (e) {
			console.log(e);
		}
	}

	const signalEvent = (e) => {
		switch (peerRef.current.signalingState) {
			case 'stable':
				// setConnection({connection: true, peerID: otherRef.current});
				break;
			default:
				// setConnection({connection: false, peerID: 'NONE'})
		}
	}

	const sendMessage = (msg, calleeID) => {
		// channelRef.current.send(msg);
		connections[calleeID].channel.send(msg);
	}

	const handleChannelClose = (calleeID) => {
		try {
			connections[calleeID].rtc.close();
			delete connections[calleeID];
			console.log('ok dc')
		// socket.emit('close-channel', {callee: calleeID});
		} catch(e) {
			console.log('Already Disconnected')
		}
	}

	const disconnectRTC = (incoming) => {
		// peerRef.current.close();
		console.log(incoming.id)
		// setConnection({connection: false, peerID: 'NONE'});
	}

	socket.off('offer-connection').on('offer-connection', handleOffer);

	socket.off('answer-connection').on('answer-connection', handleAnswer);

	socket.off('ice-candidate').on('ice-candidate', newIceCandidate);

	socket.off('close-channel').on('close-channel', disconnectRTC);

	// console.log(connection)

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

	return (
		<div className="App">
			<div className="recipient-container">
				{nearby.filter((value) => value.id !== selfRef.current).map((value, key) => {
					return ( <div key={key}>
						<Recipient 
						recipient={value} 
						idx={key} 
						recipientCount={nearby.length}  
						connectRTC={onConnectRTC}
						send={sendMessage}
						/>
						<button onClick={() => sendMessage('hello', value.id)}>Send</button>
						<button onClick={() => handleChannelClose(value.id)}>DC</button>
						<button onClick={() => console.log(connections)}>con</button>
						</div> )
				})}
			</div>
			<div className="footer-container">
				<p>You are known as: {selfRef.current.slice(0, 5)}</p>
			</div>
		</div>
	);
}

export default App;
