import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadIntreval;
const loader = (element) => {
  element.textContent = " ";

  loadIntreval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = " ";
    }
  }, 300);
};

const typeText = (element, text) => {
  element.textContent = "";

  const textLength = text.length;
  let textIndex = 0;

  let intreval = setInterval(() => {
    if (textIndex < textLength) {
      element.textContent += text.charAt(textIndex);
      textIndex++;
    } else {
      clearInterval(intreval);
    }
  }, 20);
};

const generateUinqueId = () => {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);
  return `id-${timeStamp}-${hexaDecimalString}`;
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
    <div class="wrapper ${isAi ? "ai" : ""}">
      <div class="chat">
        <div class="profile">
        <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // users chatstrips
  chatContainer.innerHTML = chatStripe(false, formData.get("prompt"));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUinqueId();

  // scroll to top
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: formData.get("prompt"),
    }),
  });

  clearInterval(loadIntreval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = response.json();
    const parsedData = JSON.parse(data);
    typeText(parsedData.bot.trim());
  } else {
    const err = await response.json();
    console.log(err);
    messageDiv.innerHTML = "Something went wrong";
    alert(err.error.error.message);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (event) => {
  if (event.keyCode == 13) {
    handleSubmit(event);
  }
});
