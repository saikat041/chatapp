import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { TextField, Button } from "@material-ui/core";
import "./styles.css";

export default function Home() {

  const [nickName, setNickName] = useState('');

  const history = useHistory();

  function handleNickNameChange(e) {
    setNickName(e.target.value);
  }

  function talkToStranger() {
    let location = { pathname: '/talkToStranger', state: { userName: nickName } };
    history.push(location);
  }

  function groupChat() {
    let location = { pathname: '/chatRooms', state: { userName: nickName } };
    history.push(location);
  }

  function isDisabled() {
    if (nickName.trim() === '') {
      return true;
    }
    return false;
  }

  return (
    <div style={{ textAlign: "center" }}>

      <TextField label="Nickname" placeholder="Type your nickname" onChange={handleNickNameChange} />

      <div style={{ marginTop: '10px' }}>
        <Button disabled={isDisabled()} variant="contained" color="primary" style={{ marginRight: "5px" }} onClick={talkToStranger}>
          Talk To Stranger
        </Button>
        <Button disabled={isDisabled()} variant="contained" color="primary" style={{ marginLeft: "5px" }} onClick={groupChat}>
          Go To Chat Rooms
        </Button>
      </div>
    </div>
  );
}
