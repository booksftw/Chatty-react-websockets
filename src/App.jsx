import React, {Component} from 'react';
import uuidv1 from 'uuid/v1'

class Navbar extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <nav className="navbar">
        <a href="/" className="navbar-brand">Chatty</a>
      </nav>
    )
  }
}


class Message extends Component {
  constructor(props) {
    super(props)
  }

  render(){
    return(
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
    this.state = {
      test:['1','2','3'],
      test2: 'test2'
    }
  }
  
  render() {
    const msgsArray = this.props.messages.map( (msg,index) => {
      return <Message username={msg.username} content={msg.content} key={index}/>
    });
    return(
      <main className="messages">
        {msgsArray}
        <div className="message system">
          Anonymous1 changed their name to nomnom.
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

  handleUserEnter(e){
    if (e.key === 'Enter') {
      const newUserName = e.target.value
      console.log('user target val',newUserName)
      this.props.updateName(newUserName)
    }
  }

  render () {
    return(
      <div>
      <footer className="chatbar">
        <input className="chatbar-username" placeholder="Update Username and hit Enter (Optional)" defaultValue= {this.props.currUser} onKeyUp={ this.handleUserEnter } />
        <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyUp={ this.handleKeyPress }  />
      </footer>
    </div>
    )
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentUser: {name: "Bob"}, // optional. if currentUser is not defined, it means the user is Anonymous
      messages: [
        // {
        //   username: "Bob",
        //   content: "Has anyone seen my marbles?",
        // },
        // {
        //   username: "Anonymous",
        //   content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
        // },
        // {
        //   username: "Anonymous",
        //   content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
        // }
      ]
    }
    this.addNewMessage = this.addNewMessage.bind(this)
    this.updateUserName = this.updateUserName.bind(this)
  }

  updateUserName(newUserName){

    this.setState({
      currentUser: {name: newUserName}
    })
  }

  addNewMessage(msg) {
    const socket = new WebSocket("ws://localhost:3001")

    //set parent state
    const newMessagePiece = {id: uuidv1(), username: this.state.currentUser.name, content: msg}
    const {id ,username, content } = newMessagePiece
    
    this.setState({
        messages: this.state.messages.concat(newMessagePiece)
    })    

    socket.onopen = () => {
      const latestMessages = this.state.messages
      socket.send(JSON.stringify(latestMessages) )
    }
  }
    
    componentDidMount() {
      const socket = new WebSocket("ws://localhost:3001")

      socket.onopen = function () {
        console.log('Connected to server')
      }

      socket.onmessage = (latestMessages) => {
        console.log('received message')
        const msgParsed = JSON.parse(latestMessages.data)
        // console.log('MSG Data Parsed', msgParsed)

        // ? Hot fix to Direct Replace messages:[object,...] state - concat not set up for me
        var x = []
        var tempMessages = Object.assign(x, msgParsed) //? Ask Nima: [ object, ... ] how to replace the state, isPossible?

        this.setState({
          //messages :  this.state.messages 
          messages :  tempMessages 

        });
      }
  }
  

  render() {
    return (
      <span>
        <Navbar />
        <h1>Hello Reactz :)</h1>
        
        <MessageList messages={this.state.messages}  /> 
        <Chatbar currUser={this.state.currentUser.name} addMessage={this.addNewMessage}  updateName={this.updateUserName}   />
      </span>
    );
  }
}
export default App;
