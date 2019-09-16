const newButton = document.getElementById('addPost');
const deleteButton = document.getElementById('delete');
const editButton = document.getElementById('edit');

const addPost = function() {
  fetch('/submit.html', {
    method: 'GET',
  })
  .then(function(response) {
    window.location.href = response.url;
  });
}

const deletePost = function() {
  fetch('/home.html', {
    method: 'GET',
  })
  .then(function(response) {
    window.location.href = response.url;
  })
}

const editPost = function() {
  fetch('/submit.html', {
    method: 'GET',
  })
  .then(function(response) {
    window.location.href = response.url;
  })
}

window.onload = function() {
  newButton.onclick = addPost;
  deleteButton.onclick = deletePost;
  editButton.onclick = editPost;
}