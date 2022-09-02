class Storage {

    constructor() {
        this.users = [];
        this.clients = new Map();
        this.rooms = new Map();
        this.userrooms = new Map();

        this.registerUser('a');
        this.registerUser('b');
        this.registerUser('c');
        this.createRoom('r1','a',['a','b']);
        this.createRoom('r2','b',['b','c']);
        this.createRoom('r3','c',['a','b','c']);
    }

    isUsernameInUse(uname) {
        return this.users.includes(uname);
    }

    registerUser(uname) {
        this.users.push(uname);
        this.userrooms.set(uname,new Set());
    }

    getAllUser() {
        return Array.from(this.users);
    }

    addClient(uname,client) {
        this.clients.set(uname,client);
    }

    getClient(uname) {
        return this.clients.get(uname);
    }

    removeClient(client) {
        this.clients.delete(client.uname)
    }

    isRoomExists(roomname) {
        return [...this.rooms.keys()].includes(roomname);
    }

    createRoom(name,admin,participants) {
        this.rooms.set(name,{name,admin,participants,chats: []});
        participants.forEach((p) => {
            this.userrooms.get(p).add(name);
        });
    }

    getAllMyRooms(uname) {
        let rooms = this.userrooms.get(uname);
        return Array.from(rooms ? rooms : new Set());
    }

    getRoom(roomname) {
        return this.rooms.get(roomname);
    }

    addChat(roomname,chat) {
        let room = this.rooms.get(roomname);
        if (room) {
            room.chats.push(chat);
        }
        return room;
    }
}

module.exports = Storage