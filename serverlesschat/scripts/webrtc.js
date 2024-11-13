// webrtc.js: handles WebRTC connection and data channel setup
import { transmitOverSound } from "./signaling.js"; // Import transmitOverSound to use in this file

let peerConnection;
let dataChannel;

// Initialize WebRTC connection
async function initializeConnection(isOfferer) {
  peerConnection = new RTCPeerConnection();
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      transmitOverSound({ candidate: event.candidate });
    }
  };

  if (isOfferer) {
    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannel();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    transmitOverSound({ sdp: offer });
  } else {
    peerConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };
  }
}

// Setup data channel for chat
function setupDataChannel() {
  dataChannel.onmessage = (event) => {
    const chat = document.getElementById("chat");
    chat.innerHTML += `<p>Peer: ${event.data}</p>`;
  };
  dataChannel.onopen = () => {
    document.getElementById("message").disabled = false;
    document.getElementById("send").disabled = false;
  };
}

// Handle received signaling data
async function handleSignalingData(data) {
  if (data.sdp) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    if (data.sdp.type === "offer") {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      transmitOverSound({ sdp: answer });
    }
  } else if (data.candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

export { initializeConnection, handleSignalingData };