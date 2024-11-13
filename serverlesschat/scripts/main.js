// main.js: main app logic, combines signaling and WebRTC setup

import { transmitOverSound, listenForSound } from "./signaling.js";
import { initializeConnection, handleSignalingData } from "./webrtc.js";

let isHost = false; // Define isHost globally so it can be referenced in event handlers

document.getElementById("host").onclick = async () => {
  isHost = true;
  await initializeConnection(true);
  listenForSound(handleSignalingData);
};

document.getElementById("join").onclick = async () => {
  isHost = false;
  await initializeConnection(false);
  listenForSound(handleSignalingData);
};

document.getElementById("send").onclick = () => {
  const message = document.getElementById("message").value;
  dataChannel.send(message);
  const chat = document.getElementById("chat");
  chat.innerHTML += `<p>You: ${message}</p>`;
  document.getElementById("message").value = "";
};