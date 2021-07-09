const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
const container=document.getElementById('message-container');
const form=document.getElementById('sent-container');
const message=document.getElementById('message');
myVideo.muted = true
const name=prompt('Name')
const peers = {}

const mic=document.getElementById('mic')

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)
    socket.on('user-connected',userId => { 
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]){
        peers[userId].close()
    }
})

myPeer.on('call',call=>{
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)

        })
    })
}) 

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id,name)
})

socket.on('new message',(data)=>{
    if(data.user!==name)
        container.appendChild(document.createElement('div')).innerHTML=data.user+": "+data.message;
});

form.addEventListener('submit',f=>{
    f.preventDefault();
    socket.emit('message',message.value);
    container.appendChild(document.createElement('div')).innerHTML="You : " +message.value;
    message.value='';
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    console.log('called')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId]= call
}
function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
    video.play()
    })
    videoGrid.append(video)
}