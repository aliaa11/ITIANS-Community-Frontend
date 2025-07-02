// src/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem("access-token");

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'efe79301f365dbf8cc6b', // من .env
  cluster: 'eu',
  forceTLS: true,
  encrypted: true,
  authEndpoint: 'https://itians-community-backend-production.up.railway.app/api/broadcasting/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

export default echo;
