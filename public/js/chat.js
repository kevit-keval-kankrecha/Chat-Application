const socket = io();

const $messageForm = document.getElementById('form');
const $messageForminput = document.getElementById('input');
const $messageFormButton = document.getElementById('button');
const $locationButton = document.getElementById('location');
const $messages = document.getElementById('messages');


//Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;


//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScrolling=()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessagesMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessagesHeight = $newMessage.offsetHeight+newMessagesMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight
    
    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop+visibleHeight

    if(containerHeight-newMessagesHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}
//server send message
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('LTS')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScrolling();
});


//list actives users
socket.on('roomData',({room,users})=>{

    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    });


    document.getElementById('sidebar').innerHTML=html

})


//send location
socket.on('messageLocation', (locationURL) => {
    const html = Mustache.render(locationMessageTemplate, {
        locationMessage: locationURL.url,
        createdAt: moment(locationURL.createdAt).format('LTS')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScrolling()
});

//to send message to server
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //disable
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = $messageForminput.value;
    socket.emit('sendMessage', message, (message) => {
        //enable
        $messageFormButton.removeAttribute('disabled');
        $messageForminput.value = '';
        $messageForminput.focus();
        console.log(message);
    });
});


//for sending location to server
document.getElementById('location').addEventListener('click', () => {
    //disable
    $locationButton.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        alert("GeoLocation is not supported by your browser.");
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const location = {};
        location.latitude = latitude;
        location.longitude = longitude;
        socket.emit('sendLocation', location, (message) => {
            //enable
            $locationButton.removeAttribute('disabled');
            console.log(message);
        });
    });
});

//when user join chat room
socket.emit('join', { username, room }, (error) => {
    alert(error);
    location.href='/'
});