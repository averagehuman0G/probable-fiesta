const Sequelize = require('sequelize');

const replaydb = new Sequelize({
    dialect: 'sqlite', 
    storage: '../replaydb.sqlite',
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


replaydb.sync({ force: force_reset }).then( () => {
    console.log('synced SQlite db to models');
});

