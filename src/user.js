let users = [];

const addUser = ({id, username, roomname, pkey}) => {
    const isUserExist = users.find(user => {
        return user.roomname === roomname && user.username === username
    });

    if(isUserExist){
        console.log('This user name in this room is not available');
        return {
            error: 'This user name in this room is not available'
        }
    } else {
        users.push({id, username, roomname, pkey});
        console.log('Users: ', users);
        let addedUser = {id, username, roomname, pkey}
        return {addedUser};
    }
};

const removeUser = (id) => {
    let userIndex = users.findIndex((user) => {
        return user.id === id;
    });
    if(userIndex >= 0){
        let userRoomName = users[userIndex].roomname;
        users.splice(userIndex, 1);
        console.log(`user at index ${userIndex} removed`);
        console.log('Users: ', users);
        return userRoomName;
    } else {
        return null;
    }
};

const roomUserCount = (roomname) => {
    return users.filter((user) => user.roomname === roomname).length;
};

const getAdminUser = (roomname, id) => {
    let admin = users.find(user => {
        return user.roomname === roomname;
    });

    if(admin && admin.id !== id){
        return {id: admin.id};
    } else {
        return false;
    }
};

module.exports = {
    addUser,
    removeUser,
    roomUserCount,
    getAdminUser
};