const seshid = window.location.href.split('/')[4];

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");


let socket = io();

function findDiff(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getTime() - date2.getTime(); 
}

function applyChange(changes) {
    console.log('going to apply changes');
    //every change that I apply I want to play after x amount of time
    let timeToWait = 0; 
    
    for(let i = 0; i < changes.length; i++) {
        let e = changes[i].change;
        let diff = 0;
        if(changes[i + 1]) {
            diff = findDiff(changes[i + 1].createdAt, changes[i].createdAt);
            timeToWait += diff;
        }

        if(e.action === "insert") {
            setTimeout(() => {
                editor.session.insert(e.start, e.lines[0]);
            }, timeToWait);
            timeToWait += diff; 
        } else if(e.action === "remove") {
            setTimeout(() => {
                editor.session.remove(e);
            }, timeToWait);
            timeToWait += diff; 
        } else {
            console.log('this action hasn\'t been accounted for');
            console.log(e.action);
        }
    }
    console.log('done applying all changes');
    
    //sqlite(name of session, json blob)
    //as they come in from the client you then save them in a row of a sqlite db
    //save each change as one row
    //sessionId operation(event obj)
    //

}


editor.session.on('change', (e) => {
    socket.emit('change', seshid, e);
});

const replayBtn = document.getElementById('replay');

replayBtn.addEventListener('click', (e) => {
    socket.emit('replay', seshid);
});


socket.on('replayChanges', (changes) => {
    editor.setValue("");
    applyChange(changes);
}); 

