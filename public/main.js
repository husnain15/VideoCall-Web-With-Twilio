const form = document.getElementById("room-name-form");
const roomNameInput = document.getElementById("room-name-input");
const container = document.getElementById("video-container");

const startRoom = async (event) => {

  event.preventDefault();
  form.style.visibility = "hidden";
  const roomName = roomNameInput.value;

   const response = await fetch("/join-room", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomName: roomName }),
  });
  const { token } = await response.json();

     const room = await joinVideoRoom(roomName, token);

    handleConnectedParticipant(room.localParticipant);
    room.participants.forEach(handleConnectedParticipant);
    room.on("participantConnected", handleConnectedParticipant);
  room.on("participantDisconnected", handleDisconnectedParticipant);
  window.addEventListener("pagehide", () => room.disconnect());
  window.addEventListener("beforeunload", () => room.disconnect());
  };
  


  const handleConnectedParticipant = (participant) => {
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    container.appendChild(participantDiv);
  
    console.log("participant: ",participant)
    participant.tracks.forEach((trackPublication) => {
console.log("TrackPublications: " ,trackPublication)

      handleTrackPublication(trackPublication, participant);
    });
  
    participant.on("trackPublished", handleTrackPublication);
  };
  
  const handleTrackPublication = (trackPublication, participant) => {
    function displayTrack(track) {
      const participantDiv = document.getElementById(participant.identity);
       participantDiv.append(track.attach());
    }
   if (trackPublication.track) {
    displayTrack(trackPublication.track);
  }

  trackPublication.on("subscribed", displayTrack);
  };

  const handleDisconnectedParticipant = (participant) => {
     participant.removeAllListeners();
    const participantDiv = document.getElementById(participant.identity);
    participantDiv.remove();
  };

const joinVideoRoom = async (roomName, token) => {
  const room = await Twilio.Video.connect(token, {
    room: roomName,
  });
  return room;
};

form.addEventListener("submit", startRoom);