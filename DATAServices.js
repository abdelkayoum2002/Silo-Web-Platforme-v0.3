const CLIENTService = require('./CLIENTServices');


let socket=null;
let message = null;

function init(io) {
    socket = io;
}

function DDS(msg){
    let parts = msg.topic.split('/');
    const siloId = parts.pop();             // 'unknown'
    const topic = parts.join('/');  
    const silo = CLIENTService.silos().find(s => s.id === siloId);
    if(msg.type==='SensorTopic'){
        const data = JSON.parse(msg.data);
        if(silo){
            silo.sensorStatus = data;
            silo.connectionStatus.connected = true;
            socket.emit('silos', CLIENTService.silos());
        }
    }
    if(msg.type==='EmergencyTopic'){
        message= {type:'Emergency', from:siloId, data:msg.data.toString()}
        socket.emit('message', message);
        console.log(message)
    }
    if(msg.type==='AlertTopicTopic'){
        message= {type:'Alert', from:siloId, data:msg.data.toString()}
        socket.emit('message', message);
        console.log(message)
    }
    if(msg.type==='MessageTopic'){
        message= {type:'Message', from:siloId, data:msg.data.toString()}
        socket.emit('message', message);
        console.log(message)
    }
    if (msg.type === 'StatusTopic') {
        const sousType = topic.split('/').pop();
        if (sousType === 'ping') {
            const now = Date.now();
            if (silo && CLIENTService.getLastPingTimestamp) {
                const pingTime = CLIENTService.getLastPingTimestamp();
                if(!silo.connectionStatus.connected){
                    socket.emit('notification',{type:'silo_status', from:siloId, data:'connected'})
    
                }
                silo.connectionStatus.connected = true;
                silo.connectionStatus.ping = now - pingTime;
                silo.lastPongTime = now; // update lastPong time
                socket.emit('silos', CLIENTService.silos());
                console.log(`pong received from ${siloId}, latency: ${silo.connectionStatus.ping}ms`);
            }
        }
    }

}

module.exports = {
    init,
    DDS,
    message: () => message
}