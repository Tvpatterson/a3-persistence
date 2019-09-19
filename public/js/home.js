const newButton = document.getElementById('addPost');

let posts = []

const addPost = function() {
  fetch('/submit.html', {
    method: 'GET',
  })
  .then(function(response) {
    window.location.href = response.url;
  });
}

const editPost = function() {
  fetch('/submit.html', {
    method: 'GET',
  })
  .then(function(response) {
    window.location.href = response.url;
  })
}

const createTable = function(data) {
  var table = document.createElement('table');
  var head = document.createElement('thead');
  var body = document.createElement('tbody');
  
  var headRow = document.createElement('tr');
  for(var cellData in data[0]){
      if(cellData != 'username'){
        let header = document.createElement('th');
        header.appendChild(document.createTextNode(cellData.charAt(0).toUpperCase() + cellData.slice(1)));
        headRow.appendChild(header);
      }
  }
  let modify = document.createElement('th');
  modify.appendChild(document.createTextNode('Modify'));
  headRow.appendChild(modify);
  head.appendChild(headRow);
  
  data.forEach(function(rowData) {
    var row = document.createElement('tr');
    for(var cellData in rowData){
      var cell = document.createElement('td');
      if(cellData != 'username'){
        cell.appendChild(document.createTextNode(rowData[cellData]));
        row.appendChild(cell);
      }
    }
    let deleteButton = document.createElement('input')
    let editButton = document.createElement('input')
    let modifyDiv = document.createElement('div');
    let modifyCell = document.createElement('td')
    modifyDiv.className = "btn-group"

    deleteButton.id = "delete"
    deleteButton.type = "submit"
    deleteButton.value = "Delete"
    deleteButton.className = "btn-primary"
    deleteButton.onclick = function() {
      let date = rowData['date']
      let time = rowData['time']
      let body = JSON.stringify({date:date, time:time})
      fetch('/delete', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: body
      })
      .then(function(response) {
        window.location.href = response.url;
      })
    }

    editButton.id = "edit"
    editButton.type = "submit"
    editButton.value = "Edit"
    editButton.className = "btn-primary"
    editButton.onclick = function() {
      let message = JSON.stringify({edit:true, message:rowData['body'], time:rowData.time, date:rowData.date})
      fetch('/edit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: message
      })
      .then(function(response) {
        window.location.href = response.url;
      })
    }

    modifyDiv.appendChild(deleteButton)
    modifyDiv.appendChild(editButton)
    modifyCell.appendChild(modifyDiv)
    row.appendChild(modifyCell)
    
    body.appendChild(row);
  });
  
  body.appendChild
  
  table.appendChild(head);
  table.appendChild(body);
  table.className = "table"
  document.body.appendChild(table);
}

window.onload = function() {
  newButton.onclick = addPost;
  
  posts = fetch('/home', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  .then(response => response.json());
  posts.then(function(data) {
    createTable(data.posts);
  });
}