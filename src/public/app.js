// Put all your frontend code here.
const messageList = document.querySelector(".toast-body");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`wss://${window.location.host}`);
const nickname = prompt("당신의 닉네임은?");

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function handleOpen() {
  console.log("Connected to Server ✅");
}

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", (message) => {
  const div = document.createElement("div");
  div.innerText = message.data;
  messageList.append(div);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("nickname", nickname));
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);

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
