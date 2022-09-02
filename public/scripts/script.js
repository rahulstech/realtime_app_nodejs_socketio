function appendChat(chat) {
    let isSelf = Cookies.get('uname') == chat.sender;
    
    $("#section_chat_messages").append(
        $('<div class="list-group-item">'+
        '<h4>'+(isSelf ? "You" : chat.sender)+'</h4>'+
        '<p>'+chat.message+'</p>'+
        '</div>')
    );
    
    let sectionChat = $("#section_chat");
    sectionChat.scrollTop(sectionChat.prop('scrollHeight'));

}
const ws = io();

ws.on('receive', (chat) => {
    let roomname = Cookies.get('roomname');
    if (chat.room == roomname) {
        appendChat(chat);
    }
});

ws.on('createroom', (data) => {
    let roomname = data.roomname;
    $("#myrooms").append(
        $(`<a class='list-group-item list-group-item-action' href='/chat/${roomname}'>${roomname}</a>`)
    );
});

$("#send_message").submit(function(e){
    e.preventDefault();
    let sender = Cookies.get('uname');
    let room = Cookies.get('roomname');
    let message = $("#in_message").val();
    if (!message) return;
    let chat = {room,sender,message};
    ws.emit('send',chat);
    $("#in_message").val('');
    appendChat(chat);
})
