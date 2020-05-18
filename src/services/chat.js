const chatUsers = []

// TODO: переместить в chat.js. Возможно.
// addUser - добавление пользователя в массив chatUsers
const addUser = ({ userId, username, room }) => {
    // Clean the data
    console.log('addUser data: ', userId, username, room)
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    // if(!username || !room){
    //     return {
    //         error: 'Username and room are required!'
    //     }
    // }

    // Check for existing user
    const existingUser = chatUsers.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { userId, username, room }
    chatUsers.push(user)
    console.log('addUser chatUsers: ', chatUsers)
    return { user }
}
// removeUser - удаление пользователя из массива chatUsers
const removeUser = (id) => {
    const index = chatUsers.findIndex((user) => user.userId === id)
    if (index !== -1) {
        return chatUsers.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    console.log('getUser id: ', id)
    console.log(chatUsers.find((user) => user.userId === id))
    return chatUsers.find((user) => user.userId === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return chatUsers.filter((user) => user.room === room)
}

const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    generateMessage
}