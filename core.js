const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const MQTTService = require('./MQTTServices');
const CLIENTService = require('./CLIENTServices');
const DATAService = require('./DATAServices');
const LOGINService = require('./LOGINServices');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

LOGINService.init(app, io);
MQTTService.init(io);
CLIENTService.init(io);
DATAService.init(io);
io.on('connection', (socket) => {
    let userRole = null;

    socket.emit('configuration', MQTTService.configuration());
    socket.emit('silos', CLIENTService.silos());
    socket.emit('mqtt_status',MQTTService.status());
    socket.emit('topics', MQTTService.topics());

    socket.on('set_role', (role) => {
        userRole = role;
    });

    socket.on('add_silo', (id) => {
        /*if(userRole === 'admin')*/ CLIENTService.addSilo(id);
    });

    socket.on('delete_silo', (id) => {
        CLIENTService.deleteSilo(id);
    });

    socket.on('mqtt_connect', (configuration) => {
        MQTTService.connectToMQTT(configuration);
    });

    socket.on('mqtt_disconnect', () => {
        MQTTService.disconnectMQTT();
    });

     socket.on('subscribe' , ({ type, topic, qos }) =>{
        MQTTService.subscribeToTopic(type,topic, qos);
    });

    socket.on('unsubscribe', (topic)=> {
        console.log(topic)
        MQTTService.unsubscribeToTopic(topic);
    });

    socket.on('deleteTopic', (topic)=> {
        console.log(topic)
        MQTTService.deleteTopic(topic);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});