const submitButton = document.getElementById('addPost');

let editTime = "";
let editDate = "";

const submitPost = function() {
  let message = document.getElementById('message');
  let body = JSON.stringify({message:message.value});
  fetch('/submit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: body
  })
  .then(function(response) {
    window.location.href = response.url;
  });
}

const editPost = function() {
  let message = document.getElementById('message');
  let body = JSON.stringify({message:message.value, time:editTime, date:editDate})
  fetch('/completeedit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body:body
  })
  .then(function(response) {
    window.location.href = response.url;
  })
}

function updateButton() {
  if(document.getElementById('message').value === "") {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

window.onload = function() {
  let edit = fetch('/isedit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  .then(response => response.json())
  edit.then(function(response) {
    if(response.edit == true) {
      let messageBox = document.getElementById('message');
      messageBox.value = response.message
      editTime = response.time;
      editDate = response.date;
    }
    if(response.edit == true) submitButton.onclick = editPost;
      else {
        submitButton.onclick = submitPost;
    }
  })
}