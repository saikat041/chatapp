import React from "react";
import { Button, Paper } from "@material-ui/core";

import "./styles.css";

export default function Room(props) {
  const { group, onJoinGroup } = props;

  return (
    <Paper elevation={3} style={{ marginTop: "5px" }}>
      <div>{group.name}</div>
      <Button variant="contained" color="primary" onClick={()=>{onJoinGroup(group)}}>
        Join
      </Button>
    </Paper>
  );
}
