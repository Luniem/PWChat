
const nav = document.getElementsByTagName("nav")[0];
const chatButton = document.getElementById("chat-button");

chatButton.addEventListener('click', () => {
    nav.classList.toggle("reduced")
})