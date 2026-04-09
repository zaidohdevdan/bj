import { io } from 'socket.io-client';

const rawUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://bj-kl2b.onrender.com';
const socketUrl = rawUrl.replace(/\/+$/, '');

const socket = io(socketUrl, {
  autoConnect: false,
  auth: (cb) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    cb({ token });
  }
});

export default socket;
