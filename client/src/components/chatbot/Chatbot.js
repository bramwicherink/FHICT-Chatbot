import React, { Component } from 'react';
import axios from 'axios/index';
import Message from './Message';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';

const cookies = new Cookies();

class Chatbot extends Component {   

    messagesEnd; 
    // Initialiseert de data component
    constructor(props) {
        super(props);
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this.state = {
            messages: []
        }

        if(cookies.get('userID') === undefined) {
        cookies.set('userID', uuid(), {path: '/'});
        }
        console.log(cookies.get('userID'));
    }

    // Functie die zorgt voor het juist weergeven van de tekst in de chatbotwidget

    async df_text_query(text) {

        // Data initialisatie
        let says = {
            speaks: 'Ik',
            msg: {
                text: {
                    text: text
                }
            }
        }
        // Zorgt voor het juist weergeven van de data
        this.setState({ messages: [...this.state.messages, says] });
        // Opvragen van gegevens in de backend / API vanuit Dialogflow
        const res = await axios.post('api/df_text_query', { text, userID: cookies.get('userID') })

        // Checkt voor iedere 'message' of het vanuit de 'bot' of 'user' komt. 
        for(let msg of res.data.fulfillmentMessages) {
            console.log(JSON.stringify(msg));
            console.log(msg);
            says = {
                speaks: 'bot',
                msg: msg
            }
            this.setState({ messages: [...this.state.messages, says]});
        }
    };

    

    async df_event_query(event) {
        const res = await axios.post('api/df_event_query', { event, userID: cookies.get('userID') })

        for(let msg of res.data.fulfillmentMessages) {
            let says = {
                speaks: 'bot',
                msg: msg
            }
            this.setState({ messages: [...this.state.messages, says]});
        }
    }

    componentDidMount() {
        this.df_event_query('Welcome');
    }

    componentDidUpdate () {
        this.messagesEnd.scrollIntoView({ behaviour: "smooth" })
    }

    renderMessages(stateMessages) {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                // if(messages.msg && messages.msg.text && messages.msg.text.text) {
                //     return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />
                // }   
                // else {
                //     return <h2>Cards</h2>
                // }
                
            })
        } else {
            return null;
        }
    }

    _handleInputKeyPress(e) {
        if (e.key === 'Enter') {
            this.df_text_query(e.target.value);
            e.target.value = '';
        }
    }

    render() {
        return (
          <div style={{height: 800, width: 400, float: 'right'}}>
              <div id="chatbot" style={{height: '100%', width: '100%', overflow: 'auto'}}>
                  <h2>Chatbot Carl</h2>
                  {this.renderMessages(this.state.messages)}
                  <div ref={(el) => { this.messagesEnd = el; }} style={{float: 'left', clear: 'both'}}>

                  </div>
                  <input type="text" onKeyPress={this._handleInputKeyPress}></input>
              </div>
          </div>  
        )
    }
}


export default Chatbot;