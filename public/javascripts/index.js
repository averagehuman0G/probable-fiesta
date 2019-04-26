const editor = ace.edit("editor");
const seshid = window.location.href.split('/')[4];
const socket = io();

//get the current data for this room
socket.emit('getData', seshid);

socket.on('initEditor', (str) => {
    editor.setValue(str);
});

editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.session.on('change', (e) => {
    socket.emit('change', seshid, e);
    //get the value of the editor and set it to the database
    let saveThis = editor.getValue();
    socket.emit('setData', seshid, saveThis);
});



const replayBtn = document.getElementById('replay');

replayBtn.addEventListener('click', (e) => {
    //instead of sending an event to the server we are going to go to the replay page
    //socket.emit('replay', seshid);
    window.location.href = "http://localhost:3000/replay/" + seshid;
});



