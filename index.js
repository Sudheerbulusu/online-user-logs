const WebSocket = require('ws')
const fs = require('fs')

var byteSize = 256
var bytesRead = 0
var file

var websocketClients = [];

fs.open('logs.txt', 'r', function(err, logFile) {
    if (err) {
        console.log(err)
        return
    }
    file = logFile
});

const wss = new WebSocket.Server({
    port: 3000 
});

wss.on("connection", function connection(ws) {
    console.log("Connected")
    
    websocketClients.push(ws)

    readAll(ws)

    ws.on("close", function close() {
        console.log("Disconnected")
    });
});

const readAll = (ws) => {
    var stats = fs.fstatSync(file)
    fs.read(file, Buffer.alloc(byteSize), 0, stats.size, 0, (err, byteCount, buff) => {
        if (err) {
            console.log(err)
            return
        }
        ws.send(buff.toString('utf-8', 0, byteCount))
        bytesRead+=byteCount
        readData()
    })
}

const readData = () => {
    var stats = fs.fstatSync(file)
    if(stats.size<bytesRead+1) {
        process.nextTick(readData)
    }
    else {
        fs.read(file, Buffer.alloc(byteSize), 0, byteSize, bytesRead, (err, byteCount, buff) => {
            if (err) {
                console.log(err)
                return
            }
                
            websocketClients.forEach(ws => {
                ws.send(buff.toString('utf-8', 0, byteCount))
            });
        
            bytesRead+=byteCount
            process.nextTick(readData)
        })
    }
}