const submitButton = document.getElementById('addPost');

const submitPost = function() {
  let username = document.getElementById('username');
  let message = document.getElementById('message');
  let body = JSON.stringify({username:username, message:message.value});
  fetch('/submit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: body
  })
  .then(function(response) {
    window.location.href = response.url;
  });
  return false;
}

function updateButton() {
  if(document.getElementById('message').value === "") {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

window.onload = function() {
  submitButton.onclick = submitPost;
}