import React, { Component } from 'react';
import uuidv1 from 'uuid/v1'

class Navbar extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <nav className="navbar">
        <a href="/" className="navbar-brand">Chatty</a>
        <p className="navUserDisplayText" >  ( {this.props.onlineCount} ) USERS ONLINE</p>
      </nav>
    )
  }
}

class Message extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="message">
        <span className="message-username">{this.props.username}</span>
        <span className="message-content">
          {this.props.content}
        </span>
      </div>
    )
  }
}

class MessageList extends Component {
  constructor(props) {
    super(props),
      this.state = {}
  }

  render() {
    const msgsArray = this.props.messages.map((msg, index) => {
      return <Message username={msg.username} content={msg.content} key={index} />
    });

    let notification;
    if (this.props.notifications.length > 0) {
      console.log('something in notifications')
      const lastIndex = this.props.notifications.length - 1
      notification = this.props.notifications[lastIndex].content
    } else {
      console.log('nothing in notification')
      notification = <p> Notifications show up here</p>
    }

    return (
      <main className="messages">
        {msgsArray}
        <div className="message system">
          {notification}
        </div>

      </main>
    )
  }
}

class Chatbar extends Component {
  constructor(props) {
    super(props)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleUserEnter = this.handleUserEnter.bind(this)
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.addMessage(e.target.value)
    }
  }

  handleUserEnter(e) {
    if (e.key === 'Enter') {
      const newUserName = e.target.value
      console.log('user target val', newUserName)
      this.props.updateName(newUserName)
    }
  }

  render() {
    return (
      <div>
        <footer className="chatbar">
          <input className="chatbar-username" placeholder="Update Username and hit Enter (Optional)" defaultValue={this.props.currUser} onKeyUp={this.handleUserEnter} />
          <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyUp={this.handleKeyPress} />
        </footer>
      </div>
    )
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentUser: { name: "Bob" }, 
      messages: [],
      notifications: []
    }
    this.addNewMessage = this.addNewMessage.bind(this)
    this.updateUserName = this.updateUserName.bind(this)

    this.socket = new WebSocket("ws://localhost:3001")

  }

  updateUserName(newUserName) {
    const oldUsername = this.state.currentUser.name
    this.setState({
      currentUser: { name: newUserName }
    })

    const postNotification = { type: "postNotification", content: `${oldUsername} has changed their name to ${newUserName}.` }

    this.socket.send(JSON.stringify(postNotification))
  }

  addNewMessage(msg) {
    const newMessagePiece = { id: uuidv1(), username: this.state.currentUser.name, content: msg }
    const messages = this.state.messages.concat(newMessagePiece)

    this.setState({
      messages: messages
    }, () => {
      const latestMessages = this.state.messages
      this.socket.send(JSON.stringify(latestMessages))
    })

  }

  componentDidMount() {
    this.socket.onopen = function () {
      console.log('Connected to server')
    }

    this.socket.onmessage = (latestMessages) => {
      const msgParsed = JSON.parse(latestMessages.data)
      let messageType;

      // ? Find what type of data this message is
      Array.isArray(msgParsed) ? messageType = 'message' : null
      msgParsed.type === "postNotification" ? messageType = 'notification' : null
      msgParsed.type === "onlineClientCount" ? messageType = 'clientCount' : null

      if (messageType === 'message') {
        // do message things
        this.setState({
          messages: msgParsed
        });
        console.log('messages', this.state.messages)
      } else if (messageType === 'notification') {
        // Do notification things
        this.setState({
          notifications: this.state.notifications.concat(msgParsed)
        })
        console.log('notifications', this.state.notifications)
      } else if (messageType === 'clientCount') {
        console.log('message is online client count')
        // update parent state and connect to component
        console.log('msgParsed.onlineCount', msgParsed.onlineCount)
        this.setState({
          onlineCount: msgParsed.onlineCount
        })
        console.log('this state client count', this.state.onlineCount)
      }
    }
  }

  render() {
    return (
      <span>
        <Navbar onlineCount={this.state.onlineCount} />
        <h1>Hello Reactz :)</h1>

        <MessageList messages={this.state.messages} notifications={this.state.notifications} />
        <Chatbar currUser={this.state.currentUser.name} addMessage={this.addNewMessage} updateName={this.updateUserName} />
      </span>
    );
  }
}
export default App;
