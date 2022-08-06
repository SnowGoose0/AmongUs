import './App.css';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import Recipient from './Components/Recipient/index';
import Avatar from './Components/Avatar/index'
import MessageCard from './Components/MessageCard/index';

const socket = io.connect('localhost:8080');

let connections = {}

const App = () => {

	const [message, setMessage] = useState('')
	const [messageReceived, setMessageReceived] = useState(false);

	const setConnections = (value) => {
		connections = value;
	}

	const [nearby, setNearby] = useState([]);

	const selfRef = useRef('');
	const otherRef = useRef('');
	const peerRef = useRef({});
	const channelRef = useRef();

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

	const onConnectRTC = (calleeID) => {
		createPeer(calleeID);

		peerRef.current = connections[calleeID].rtc;

		connections[calleeID].rtc.onsignalingstatechange = signalEvent;
		connections[calleeID].rtc.onicecandidate = iceEvent;
		connections[calleeID].rtc.onnegotiationneeded = () => negotiationEvent(calleeID);

		channelRef.current = connections[calleeID].rtc.createDataChannel('main');
		channelRef.current.onmessage = handleReceiveMessage;
		channelRef.current.onclose = () => handleChannelClose(calleeID);

		setConnections({...connections, [calleeID]: {
			rtc: peerRef.current,
			channel: channelRef.current,
		}})
	}

	const handleReceiveMessage = (e) => {
		setMessage(e.data);
		setMessageReceived(true);
	}

	const createPeer = (calleeID) => {
		otherRef.current = calleeID;
		// const peer = new RTCPeerConnection({
		// 	iceServers: [
		// 		{
		// 			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
		// 		},
		// 	],
		// 	iceCandidatePoolSize: 10,
		// });

		setConnections({...connections, [calleeID]: {
			rtc: new RTCPeerConnection({
				iceServers: [
					{
						urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
					},
				],
				iceCandidatePoolSize: 10,
			}),
		}})
	}

	const negotiationEvent = async (calleeID) => {
		const offer = await connections[calleeID].rtc.createOffer();
		await connections[calleeID].rtc.setLocalDescription(offer);

		const payload = {
			callee: calleeID,
			caller: selfRef.current,
			sdp: connections[calleeID].rtc.localDescription,
		};
		socket.emit('offer-connection', payload);
	}

	const handleOffer = async (offer) => {
		createPeer(offer.caller);
		otherRef.current = offer.caller;

		peerRef.current = connections[offer.caller].rtc;
		peerRef.current.ondatachannel = (e) => {
			channelRef.current = e.channel;
			channelRef.current.onmessage =  handleReceiveMessage;

			setConnections({...connections, [offer.caller]: {
				rtc: peerRef.current,
				channel: channelRef.current,
			}})
		}

		const desc = new RTCSessionDescription(offer.sdp);
		await connections[offer.caller].rtc.setRemoteDescription(desc);
		
		const ans = await connections[offer.caller].rtc.createAnswer();

		await connections[offer.caller].rtc.setLocalDescription(ans);

		const payload = {
			callee: offer.caller,
			caller: selfRef.current,
			sdp: connections[offer.caller].rtc.localDescription,
		}
		socket.emit('answer-connection', payload);
	}

	const handleAnswer = async (answer) => {
		const desc = new RTCSessionDescription(answer.sdp);
		await connections[answer.caller].rtc.setRemoteDescription(desc);
	}

	const iceEvent = (e) => {
		if (e.candidate) {
			const payload = {
				callee: otherRef.current,
				caller: selfRef.current,
				candidate: e.candidate,
			}
			socket.emit('ice-candidate', payload);
		}
	}

	const newIceCandidate = async (incoming) => {
		const candidate = new RTCIceCandidate(incoming.candidate);
		try {
			await connections[incoming.caller].rtc.addIceCandidate(candidate);
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


	socket.off('user-joined').on('user-joined', onConnectRTC)
	socket.off('offer-connection').on('offer-connection', handleOffer);
	socket.off('answer-connection').on('answer-connection', handleAnswer);
	socket.off('ice-candidate').on('ice-candidate', newIceCandidate);

	socket.off('close-channel').on('close-channel', disconnectRTC);

	socket.on('get-self', (currentSelf) => {
		selfRef.current = currentSelf;
	})

	socket.on('nearby-users', (nearbyUsers) => {
		setNearby(nearbyUsers);
	})

	console.log(connections)

	return (
		<div className="App">
			<div className="recipient-container">
				{nearby.filter((value) => value.id !== selfRef.current).map((value, key) => {
					return ( <div key={key}>
						<Recipient recipient={value}>
							<Avatar send={sendMessage} recipient={value} avatar64={value.image64}/>
						</Recipient>
						</div> )
				})}
			</div>
			<div className="footer-container">
				<p>You are known as: {selfRef.current.slice(0, 5)}</p>
			</div>

			<div>
                <AnimatePresence
                initial={false}
                exitBeforeEnter={true}
                onExitComplete={() => null}
                >
                {messageReceived && <MessageCard handleClose={(e) => {
					e.preventDefault();
					setMessageReceived(state => !state);
				}} value={message}/>}
                </AnimatePresence>
            </div>
		</div>
	);
}

export default App;
