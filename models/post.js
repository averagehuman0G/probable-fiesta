const Sequelize = require('sequelize');

const replaydb = new Sequelize({
    dialect: 'sqlite', 
    storage: './replaydb.sqlite',
    logging: () => {},
    define: {
        sync: { force: true },
        underscored: true
    },
    retry: {
        max: 10
    },
    transactionType: 'IMMEDIATE'
});

const Post = replaydb.define('post', {
    randid: { type: Sequelize.STRING, unique: true },
    text: Sequelize.TEXT
}, {
    indexes: [{
        fields: ['randid'] 
    }]
}); 

const PostOp = replaydb.define('postOp', {
    randid: Sequelize.STRING,
    change: Sequelize.JSON
}, {
    indexes: [{
        fields: ['randid'] 
    }]
});

let force_reset = process.env.force_reset;

const PostBlob = replaydb.define('postBlob', {
    randid: { type: Sequelize.STRING, unique: true },
    changes: Sequelize.BLOB,
    indexes: [{
        fields: ['randid'] 
    }]
});


replaydb.sync({ force: false }).then( () => {
    console.log('synced SQlite db to models');
});

function saveToDB(id, change) {
    PostOp.create({ randid: id, change: change });
}

function findAllChanges(id, cb) {
    //this should give us the changes from the begining in order.
    PostOp.findAll({ order: ['created_at'], where: { randid: id } }).then((changes) => { 
        //apply the changes from the array in order to the document
        cb(changes);
    });
}

function getString(id, cb) {
    Post.findOrCreate({ where: { randid: id }, defaults: {text: ''} }).then(([room, created]) => {
        if(!created) {
            console.log(room.text)
        }
        if(created) cb("");
        cb(room.text);
    });
}

function setString(id, str) {
    Post.findOne({ where: {randid: id} }).then(room => {
        room.update({ text: str }).then(() => {});
    });
};


module.exports.saveToDB = saveToDB;
module.exports.findAllChanges = findAllChanges;
module.exports.getString = getString;
module.exports.setString = setString;

