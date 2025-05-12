const { MqttClient } = require('mqtt');
const MQTTService = require('./MQTTServices');
const silos = [];
let socket=null;
let lastPingTimestamp = null;
let pingIntervalId = null;
let checkIntervalId = null;

function init(io) {
    socket = io;
}

function pingPong(pingIntervale, pingTopic, mqttClient) {
    stopPingPong();
    console.log('start ping service...')
    pingIntervalId = setInterval(() => {
        lastPingTimestamp = Date.now();
        mqttClient.publish(pingTopic, '');
        console.log('Ping sent to all silos at', lastPingTimestamp);
    }, 1000); // Every 10s
    checkIntervalId = setInterval(() => {
    const now = Date.now();
    silos.forEach(silo => {
        // If last pong was more than 5s ago → consider disconnected
        if(!silo.lastPongTime || (now - silo.lastPongTime > 5000)) {
            if(silo.connectionStatus.connected) {
                if(silo.connectionStatus.connected){
                    socket.emit('notification',{type:'silo_status', from:silo.id, data:'disconnected'})
                }
                silo.connectionStatus.connected = false;
                silo.connectionStatus.ping = 99999999;
                console.log(`[WARN] Silo ${silo.id} marked as disconnected.`);
                socket.emit('silos', silos);
            }
        }
    });
    }, 1000); 

}

function stopPingPong() {
    console.log("Stopping ping-pong...");
    clearInterval(pingIntervalId);
    clearInterval(checkIntervalId);
    pingIntervalId = null;
    checkIntervalId = null;
}


function getLastPingTimestamp() {
    return lastPingTimestamp;
}

function addSilo(id) {
  const siloExists = silos.some(silo => silo.id === id);

  if (!siloExists) {
    const newSilo = {
      id: id,
      connectionStatus: {
        connected: false,
        ping: null
      },
      lastPongTime: null,
      sensorStatus: {
        temperature: null,
        humidity: null,
        co2: null
      },
      actuatorStatus: {
        evaluator: null,  
        vane: null        
      }
    };
    silos.push(newSilo);
    socket.emit('silos', silos);
    socket.emit('notification',{type:'silo_status', from:id, data:'added'})
  } else {
    console.log(`Silo with ID ${id} already exists.`);
    socket.emit('notification',{type:'silo_status', from:id, data:'silo already exict'})
  }
}

function deleteSilo(id) {
  const index = silos.findIndex(silo => silo.id === id);

  if (index !== -1) {
    silos.splice(index, 1);
    socket.emit('silos', silos);
    console.log(`Silo with ID ${id} has been deleted.`);
    socket.emit('notification',{type:'silo_status', from:id, data:'Removed'})
  } else {
    console.log(`Silo with ID ${id} does not exist.`);
  }
}



module.exports ={
    init,
    pingPong,
    addSilo,
    deleteSilo,
    stopPingPong,
    getLastPingTimestamp,
    silos : () => silos
}
