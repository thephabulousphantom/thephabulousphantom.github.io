let transmitter;
let receiver;

// Initialize Quiet.js
Quiet.init({
  profilesPrefix: "scripts/",
  memoryInitializerPrefix: "scripts/",
  libfecPrefix: "scripts/",
  memoryInitializerPrefixURL: "scripts/",
  onReady: () => console.log("Quiet.js is ready"),
  onError: (error) => console.error("Quiet.js initialization failed:", error),
});

// Start transmitting data over sound
function transmitOverSound(data) {
  const jsonData = JSON.stringify(data);
  const arrayBuffer = Quiet.str2ab(jsonData);

  if (!transmitter) {
    transmitter = Quiet.transmitter({
      profile: "ultrasonic",
      onFinish: () => console.log("Transmission finished"),
      onError: (error) => console.error("Transmission error:", error),
    });
  }

  transmitter.transmit(arrayBuffer);
}

// Start listening for incoming sound data
function listenForSound(onDataReceived) {
  if (!receiver) {
    receiver = Quiet.receiver({
      profile: "ultrasonic",
      onReceive: (payload) => {
        const data = JSON.parse(Quiet.ab2str(payload));
        onDataReceived(data);
      },
      onCreateFail: (reason) => console.error("Receiver creation failed:", reason),
      onReceiveFail: (num_fails) => console.warn("Failed to receive data:", num_fails),
    });
  }
}

export { transmitOverSound, listenForSound };