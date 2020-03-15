import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { TextField, Button, Grid } from "@material-ui/core";
import Room from "./Room";
import { groupSocket as socket } from './io';


export default function ChatRooms() {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [helperText, setHelperText] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const history = useHistory();
  const location = useLocation();

  // if no user name is set then redirect to home page
  if (!location.state || !location.state.userName) {
    history.push({ pathname: '/' });
  }

  const { userName } = location.state;

  socket.off('groups');
  socket.on('groups', function (groups) {
    setGroups(groups);
  });

  function createGroup() {
    let group = { name:groupName, owner:userName }
    socket.emit('createGroup', group);
    let location = { pathname: '/chatRoom', state: { group, userName }};
    history.push(location);
  }

  function onJoinGroup(group){
    socket.emit('joinGroup', group);
    let location = { pathname: '/chatRoom', state: { group, userName }};
    history.push(location);
  }

  function handleGroupNameChange(e) {
    let groupName = e.target.value.trim(), helperText = null;

    if (groupName === '') {
      helperText = "Group name can't be empty";
    } else {
      for (let i in groups) {
        if (groups[i].name === groupName) {
          helperText = "Group name already exists";
          break;
        }
      }
    }
    setHelperText(helperText);
    setIsDisabled(helperText);
    setGroupName(e.target.value);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <TextField label="Room name" placeholder="type your room name" onChange={handleGroupNameChange} helperText={helperText} error={helperText} />

      <div style={{ marginTop: "15px" }}>
        <Button disabled={isDisabled} variant="contained" color="primary" onClick={createGroup}>
          Create
        </Button>
      </div>

      <div style={{ marginTop: "15px" }}>
        <Grid container spacing={3}>
          {groups.map(i => (
            <Grid item xs={4} key={i.name}>
              <Room group={i} onJoinGroup = {onJoinGroup}/>
            </Grid>
          ))}
        </Grid>
      </div>
    </div >
  );
}
