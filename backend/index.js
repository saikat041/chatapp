const server = require('http').createServer();
const io = require('socket.io')(server);


// Constants
const PAIRING_INTERVAL = 2000;  //Time interval for pair making
const PORT = process.env.PORT || 4000; //Port at which server listens

// Global variables
var unpaired_sockets_map = {}; //{socket_id : socket} of unpaired users
var paired_sockets_map = {};   //{socket_id : socket} of paired users
var username_map = {};         //{socket_id : username}
var partner_map = {};          //{socket_id : partner_socket_id} 


// function for shuffling an array
function shuffle(arr) {

    for (let i = arr.length - 1; i > 0; i--) {
        j = Math.floor((Math.random() * (i + 1)));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

}

function onChatEnd(socket) {
    let connId = socket.conn.id;

    if (!(connId in username_map)) {
        return;
    }

    console.log(username_map[connId], 'is leaving');

    id = socket.conn.id;
    partner_id = partner_map[id];


    // If the user is not paired yet.
    if (partner_id === undefined) {
        delete username_map[id];
        delete unpaired_sockets_map[id];
        return;
    }

    // sending parnerLeft message to partner
    paired_sockets_map[partner_id].emit('partnerLeft');

    // Deleting user and partner details.
    delete username_map[id];
    delete paired_sockets_map[id];
    delete partner_map[id];

    delete username_map[partner_id];
    delete paired_sockets_map[partner_id];
    delete partner_map[partner_id];
}


// Whenever someone connects this gets executed
io.on('connection', function (socket) {
    console.log('Someone connected...');

    socket.on('startChat', (data) => {
        console.log(data.userName, 'connected');
        unpaired_sockets_map[socket.conn.id] = socket;
        username_map[socket.conn.id] = data.userName;
    });

    // Message sending takes place here
    socket.on('message', (data) => {

        console.log(username_map[socket.conn.id], 'is messaging', username_map[partner_map[socket.conn.id]]);
        partnerSocket = paired_sockets_map[partner_map[socket.conn.id]];

        if (partnerSocket) {
            partnerSocket.emit('message', data);
        }

    });

    // If one user disconnects both have to reconnect again
    socket.on('disconnect', () => { onChatEnd(socket) });

    socket.on('endChat', () => { onChatEnd(socket) })

});

const groupIo = io.of('/groupChat');
const groups = [];
const GROUPS_REFRESH_INTERVAL = 1000;

groupIo.on('connection', function(socket){

    setInterval(()=>{
        socket.emit('groups', groups)
    }, GROUPS_REFRESH_INTERVAL);

    socket.on('createGroup', function(group){
        groups.push(group);
        socket.join(group.name); 
    });

    socket.on('joinGroup', function(group){
        socket.join(group.name);
    });

    socket.on('message', function({group, message}){
        groupIo.to(group.name).emit('message', message);
    });

    socket.on('leave', function(group){
        socket.leave(group.name);
    });
    
});


// Random Partner Selection
setInterval(() => {

    //Each user is assigned a partner. partner of i th socket is i+1 th socket
    //It does not create problem as we are shuffling the array
    //We are also sending each user their partner details

    socket_ids = Object.keys(unpaired_sockets_map);
    shuffle(socket_ids);

    for (let i = 0; i < socket_ids.length; i = i + 2) {

        if (i + 1 < socket_ids.length) {

            console.log('Pairing', username_map[socket_ids[i + 1]], 'and', username_map[socket_ids[i]]);

            //filling partner_map
            partner_map[socket_ids[i]] = socket_ids[i + 1];
            partner_map[socket_ids[i + 1]] = socket_ids[i];

            //Sending each user his partnerUserName
            unpaired_sockets_map[socket_ids[i]].emit('partnerDetails', { userName: username_map[socket_ids[i + 1]] });
            unpaired_sockets_map[socket_ids[i + 1]].emit('partnerDetails', { userName: username_map[socket_ids[i]] });

            //Putting the paired users in separate lists as we are updating socket_map of unpaired users
            paired_sockets_map[socket_ids[i]] = unpaired_sockets_map[socket_ids[i]];
            paired_sockets_map[socket_ids[i + 1]] = unpaired_sockets_map[socket_ids[i + 1]];

            //Deleting sockets from unpaired_sockets_map
            delete unpaired_sockets_map[socket_ids[i]];
            delete unpaired_sockets_map[socket_ids[i + 1]];
        }
    }
}, PAIRING_INTERVAL);


// listening on defined port
server.listen(4000, function () {
    console.log(`Started lintening at port ${PORT}`)
});