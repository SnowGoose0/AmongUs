import './App.css';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, DragControls, motion } from 'framer-motion';
import streamSaver from 'streamsaver';
import io from 'socket.io-client';
import axios from 'axios';
import ParticlesBackground from './Components/ParticlesBackground';
import Recipient from './Components/Recipient/index';
import Avatar from './Components/Avatar/index'
import MessageCard from './Components/MessageCard/index';

const socket = io.connect('localhost:8080');

let connections = {};

const THRESHOLD = 253555;

const worker = new Worker('../Worker.js');

const App = () => {

	const [message, setMessage] = useState('')
	const [messageReceived, setMessageReceived] = useState(false);

	const setConnections = (value) => {
		connections = value;
	}

	const [nearby, setNearby] = useState([]);
	const [file, setFile] = useState();
	const [gotFile, setGotFile] = useState(false);

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
		channelRef.current.bufferedAmountLowThreshold = THRESHOLD;
		// channelRef.current.onmessage = handleReceivingMessage;
		channelRef.current.onmessage = handleReceivingData;
		channelRef.current.onclose = () => handleChannelClose(calleeID);

		setConnections({...connections, [calleeID]: {
			rtc: peerRef.current,
			channel: channelRef.current,
		}})
	}

	const handleReceivingMessage = (e) => {
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
			// channelRef.current.onmessage =  handleReceivingMessage;
			channelRef.current.onmessage = handleReceivingData;
			channelRef.current.bufferedAmountLowThreshold = THRESHOLD;

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

	const fileNameRef = useRef('')

	const handleReceivingData = (e) => {
		if (e.data.toString().includes("done")) {
			setGotFile(true);
			const parsed = JSON.parse(e.data);
			fileNameRef.current = parsed.fileName;
		} else {
			worker.postMessage(e.data);
		}
	}

	const download = () => {
		setGotFile(false);
		worker.postMessage('download');
		worker.addEventListener('message', (e) => {
			const stream = e.data.stream();
			const fileStream = streamSaver.createWriteStream(fileNameRef.current);
			stream.pipeTo(fileStream);

		})
	}

	const selectFile = (e) => {
		setFile(e.target.files[0]);
		console.log(e.target.files[0].size)
	}

	peerRef.current.onbufferedamountlow = (e) => {
		console.log('low');
	}

	const [progress, setProgress] = useState(0)

	const sendFile = (calleeID) => {
		const channel = connections[calleeID].channel
		const chunkSize = THRESHOLD;
		const currentFile = file;

		currentFile.arrayBuffer().then((buffer) => {

			// while(buffer.byteLength) {
			// 	const chunk = buffer.slice(0, chunkSize);
			// 	buffer = buffer.slice(chunkSize, buffer.byteLength);
			// 	channel.send(chunk)
			// 	setProgress((currentFile.size - buffer.byteLength) / currentFile.size);
			// }

			const send = () => {
				while (buffer.byteLength) {
					console.log('thresh', channel.bufferedAmountLowThreshold)
					if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
						channel.onbufferedamountlow = () => {
							console.log('event');
							channel.onbufferedamountlow = null;
							send();
						};
						return;
					}
					const chunk = buffer.slice(0, chunkSize);
					buffer = buffer.slice(chunkSize, buffer.byteLength);
					setProgress((currentFile.size - buffer.byteLength) / currentFile.size);
					channel.send(chunk);
				}

				channel.send(JSON.stringify({done: true, fileName: file.name}));
			  };

			send();

		})
	}

	return (
		<div className="App">
			<ParticlesBackground />
			<div className="recipient-container">
				{nearby.filter((value) => value.id !== selfRef.current).map((value, key) => {
					return ( <div key={key}>
						<Recipient recipient={value}>
							<Avatar 
								send={sendMessage} 
								recipient={value} 
								avatar64={value.image64} 
								sendFile={sendFile} 
								selectFile={selectFile}
								progress={progress}
							/>
							{gotFile && <button onClick={download}>Download</button>}
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
