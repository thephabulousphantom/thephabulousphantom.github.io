let peerConnection;
let dataChannel;
let isOfferer = false;

// Quiet-js configuration
const config = {
  profile: "ultrasonic",
  profilesPrefix: "./lib/quiet.js/",
  memoryInitializerPrefix: "./lib/quiet.js/",
  libfecPrefix: "./lib/quiet.js/",
  onFinish: () => console.log("Sound transmission finished"),
  onError: (error) => console.error("Sound transmission error:", error)
};

Quiet.init(config);

// Initialize WebRTC
async function initializeConnection() {
  peerConnection = new RTCPeerConnection();
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // Send candidate information if available
      transmitOverSound({ candidate: event.candidate });
    }
  };

  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    setupDataChannel();
  };
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

// Transmit WebRTC info over sound
function transmitOverSound(data) {
  
  const transmitter = Quiet.transmitter({ profile: "ultrasonic" });
    
    // Example data transmission after initialization
    if (transmitter) {
        const jsonData = JSON.stringify(data)
        transmitter.transmit(Quiet.str2ab(jsonData));
    } else {
      console.error("Failed to create transmitter.");
    }
}

// Receive WebRTC info over sound
function listenForSound() {
    Quiet.receiver({
      profile: "ultrasonic",
      onReceive: (payload) => {
        const data = JSON.parse(Quiet.ab2str(payload));
        console.log("Received data:", data);
  
        // Process the received data for WebRTC
        if (data.sdp) {
          peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          if (data.sdp.type === "offer") {
            peerConnection.createAnswer().then((answer) => {
              peerConnection.setLocalDescription(answer);
              transmitOverSound({ sdp: answer });
            });
          }
        } else if (data.candidate) {
          peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      },
      onError: (error) => {
        console.error("Receiver error:", error);
      }
    });
  }

// Event listeners
document.getElementById("start").onclick = async () => {
  await initializeConnection();
  isOfferer = confirm("Are you the offerer?");
  if (isOfferer) {
    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannel();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    transmitOverSound({ sdp: offer });
  }
  listenForSound();
};

document.getElementById("send").onclick = () => {
  const message = document.getElementById("message").value;
  dataChannel.send(message);
  const chat = document.getElementById("chat");
  chat.innerHTML += `<p>You: ${message}</p>`;
  document.getElementById("message").value = "";
};
