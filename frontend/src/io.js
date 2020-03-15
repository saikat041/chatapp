import io from 'socket.io-client';

export const pairSocket = io('http://localhost:4000');
export const groupSocket = io('http://localhost:4000/groupChat');