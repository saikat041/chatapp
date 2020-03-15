import React from "react";
import Home from './Home';
import ChatRooms from './ChatRooms'
import TalkToStranger from './TalkToStranger';
import ChatRoom from './ChatRoom';
import {
  BrowserRouter as Router, Route
} from 'react-router-dom'

export default function App() {

  return (
    <Router>

      <Route exact path='/'>
        <Home />
      </Route>

      <Route path='/talkToStranger'>
        <TalkToStranger />
      </Route>

      <Route path='/chatRooms'>
        <ChatRooms />
      </Route>

      <Route path='/chatRoom'>
        <ChatRoom />
      </Route>

    </Router>

  );
}
