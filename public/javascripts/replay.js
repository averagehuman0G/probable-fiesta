const seshid = window.location.href.split('/')[4];

const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

const socket = io();

function findDiff(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getTime() - date2.getTime(); 
}

socket.on('replayChanges', (changes) => {
    applyChange(changes);
}); 

socket.emit('replay', seshid);

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

                if(e.lines.length === 1) {
                    editor.session.insert(e.start, e.lines[0]);
                } else {
                    editor.session.insert(e.start, "\n");
                }

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
}

const editBtn = document.getElementById('edit');

editBtn.addEventListener('click', (e) => {
    window.location.href = "http://localhost:3000/sesh/" + seshid;
});
