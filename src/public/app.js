// Put all your frontend code here.
const socket = io();
const changeNickBox = document.querySelector("#changeNickBox");
const messageList = document.querySelector(".toast-body");
const messageForm = document.querySelector("#message");
const roomName = document.querySelector("#roomName");
let nickname = "Anonymous";
let roomNum;
// 미디어 시작

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * 미디어 객체 get
 */
async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstrains);
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * 음소거
 */

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "음소거 해제";
    muted = true;
  } else {
    muteBtn.innerText = "음소거";
    muted = false;
  }
}

/**
 * 카메라 온오프
 */

function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "카메라 끄기";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "카메라 켜기";
    cameraOff = true;
  }
}

/**
 * 카메라 체인지
 */

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

/**
 * 방입장시 화상카메라 켜기
 */
async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomNum);
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomNum);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

/**
 * 커넥션연결
 */
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomNum);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}

// 미디어 끝

/**
 * 방 입장
 */
async function enterRoom() {
  roomNum = prompt("what your room number?");
  await initCall();
  socket.emit("enter_room", roomNum, () => {
    alert(`${roomNum}에 입장 하였습니다.`);
    roomName.innerText = `Zoom Room ${roomNum}`;
  });
}

enterRoom();

/**
 * 닉네임 변경
 */
function changeNickname() {
  const changedName = changeNickBox.querySelector("input").value;
  nickname = changedName;
  socket.emit("change_nick", nickname, () => alert(`닉네임 변경: ${nickname}`));
}

changeNickBox.querySelector("button").addEventListener("click", changeNickname);

/**
 * 메시지 보내기
 */
function sendMessage(event) {
  event.preventDefault();
  inputValue = messageForm.querySelector("input").value;
  socket.emit("new_message", inputValue, roomNum, addMessage);
}

function addMessage(message) {
  const div = document.createElement("div");
  div.innerText = message;
  messageList.append(div);
}

messageForm.addEventListener("submit", sendMessage);
/**
 * sleep
 */
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

/**
 * bootstrap
 */
const toastTrigger = document.getElementById("liveToastBtn");
const toastLiveExample = document.getElementById("liveToast");
if (toastTrigger) {
  toastTrigger.addEventListener("click", async () => {
    const toast = new bootstrap.Toast(toastLiveExample);
    await sleep(1);
    toast.show();
  });
}

/**
 * 누군가의 메시지
 */
socket.on("new_message", (message) => {
  addMessage(message);
});
