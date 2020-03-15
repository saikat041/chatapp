import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import { TextField, Paper } from "@material-ui/core";
import Alert from './Alert';
import "./styles.css";

const socket = io('http://localhost:4000');

export default function TalkToStranger() {

  const location = useLocation();
  const history = useHistory();

  // if no user name is set then redirect to home page
  if (!location.state || !location.state.userName) {
    history.push({pathname:'/'});
  }

  const [messages, setMessages] = useState([]);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [alertMessage, setAlertMessage] = useState('Pairing with someone.....');

  const { userName } = location.state;

  if (isFirstRender) {
    socket.emit('startChat', { userName });
    setIsFirstRender(false);
  }

  socket.off('partnerDetails');
  socket.on('partnerDetails', (data) => {
    setAlertMessage(`You are connected to ${data.userName}`);
  });

  socket.off('message');
  socket.on('message', (data) => {
    setMessages(messages.concat({ message: data, position: 'left' }));
  });

  socket.off('partnerLeft');
  socket.on('partnerLeft', () => {
    socket.emit('startChat', { userName });
    setAlertMessage('Your Partner Left!! Pairing with someone');
  });

  // after every dom update we are setting scroll position so that last message is visible
  useEffect(() => {
    let ele = document.getElementsByClassName('inner-message-box')[0];
    ele.scrollTop = ele.scrollHeight - ele.clientHeight;
  });

  // ending chat on unmounting
  useEffect(()=>{
    return ()=>{socket.emit('endChat')};
  }, [])

  function keyPressed(event) {
    if (event.key === 'Enter') {
      let message = event.target.value.trim();
      if (message !== '') {
        setMessages(messages.concat({ message, position: 'right' }));
        event.target.value = '';
        socket.emit('message', message);
      }
    }
  }

  return (
    <div className='message-box'>

      <Alert message={alertMessage} />

      <Paper className='inner-message-box' elevation={3}>
        {messages.map((ele, index) => {
          return (
            <div key={index} style={{ float: ele.position }} className="message-bubble">
              {ele.message}
            </div>
          );
        })}
      </Paper>

      <div style={{ textAlign: 'center' }}>
        <TextField placeholder='Type your message here' style={{ marginTop: '5px', width: '50%' }} onKeyPress={keyPressed} />
      </div>

    </div>
  );
}
