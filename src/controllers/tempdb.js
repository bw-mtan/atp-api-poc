const fs = require('fs')
const path= require('path');

function readDb(dbName = 'db.json') {
    // read JSON object from file
    const data = fs.readFileSync(path.resolve('./db',dbName), 'utf8')
    return JSON.parse(data)
}

function writeDb(obj, dbName = 'db.json') {
    if (!obj) return console.log('Please provide data to save')
    try {
        const data = readDb(dbName);
        const newObj=[...data,obj];
        fs.writeFileSync(path.resolve('./db',dbName), JSON.stringify(newObj)) //overwrites current data
        return console.log('record inserted successfully');
    } catch (err) {
        return console.error('error in writing', err)
    }
}

module.exports = { readDb, writeDb }