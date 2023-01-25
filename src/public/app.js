// Put all your frontend code here.
const socket = io();
const changeNickBox = document.querySelector("#changeNickBox");
const messageList = document.querySelector(".toast-body");
const messageForm = document.querySelector("#message");
const roomName = document.querySelector("#roomName");
let nickname = "Anonymous";
let roomNum;

/**
 * 방 입장
 */
function enterRoom() {
  roomNum = prompt("what your room number?");
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
