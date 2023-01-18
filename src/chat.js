

const inputMessage = document.getElementById('inputMessage');
const messages = document.getElementById('messages');

const baseUrl = "http://localhost:3000";
window.addEventListener('keydown', event => {
  if (event.which === 13) {
    sendMessage();
  }
  if (event.which === 32) {
    if (document.activeElement === inputMessage) {
      inputMessage.value = inputMessage.value + ' ';
    }
  }
});


function sendMessage() {
  let message = inputMessage.value;
  if (message) {
    inputMessage.value = '';
    $.ajax({
      type: 'POST',
      url: `${baseUrl}/submit-chatline`,
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('refreshToken')}`);
      },
      data: {
        message,
        refreshToken: localStorage.getItem('refreshToken')
      },
      success: function(data) {},
      error: function(xhr) {
        console.log(xhr);
      }
    })
  }
}
function addMessageElement(el) {
  messages.append(el);
  messages.lastChild.scrollIntoView();
}