import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from 'react-router-dom';
import { groupSocket as socket } from './io';
import { TextField, Paper } from "@material-ui/core";
import Alert from './Alert';
import "./styles.css";

export default function ChatRoom() {

    const location = useLocation();
    const history = useHistory();

    // if no user name is set then redirect to home page
    if (!location.state || !location.state.group || !location.state.userName) {
        history.push({ pathname: '/' });
    }

    const { group, userName } = location.state;
    const [messages, setMessages] = useState([]);
    const [alertMessage, setAlertMessage] = useState(group.name);

    socket.off('message');
    socket.on('message', (message) => {
        if(message.sender !== userName){
            setMessages(messages.concat({ message, position: 'left' }));
        } 
    });

    // after every dom update we are setting scroll position so that last message is visible
    useEffect(() => {
        let ele = document.getElementsByClassName('inner-message-box')[0];
        ele.scrollTop = ele.scrollHeight - ele.clientHeight;
    });

    // ending chat on unmounting
    useEffect(() => {
        return () => { socket.emit('leave', group) };
    }, []);

    function keyPressed(event) {
        if (event.key === 'Enter') {
            let text = event.target.value.trim();
            if (text !== '') {
                let message = { text, sender: userName };
                setMessages(messages.concat({ message, position: 'right' }));
                event.target.value = '';
                socket.emit('message', { group, message });
            }
        }
    }

    return (
        <div className='message-box'>

            <Alert message={alertMessage} />

            <Paper className='inner-message-box' elevation={3}>
                {messages.map((val, index) => {
                    let message = val.message, position = 'right', sender = null;

                    if(message.sender !== userName){
                        position = 'left';
                        sender = <div>{message.sender + ':'}</div>;
                    }

                    return (
                        <div key={index} style={{ float: position }} className="message-bubble">
                            {sender}
                            {message.text}
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
