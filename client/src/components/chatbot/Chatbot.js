import React, { Component } from 'react';
import axios from 'axios/index';
import Message from './Message';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';
import Card from './Card';

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
    // Text verwerking
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
            console.log("msg = " + JSON.stringify(msg));
            // console.log("message.msg = " + JSON.stringify(message.msg));
            //     console.log("message.msg.text = " + JSON.stringify(message.msg.text));
            //     console.log("message.msg.text.text = " + JSON.stringify(message.msg.text.text));
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

    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behaviour: "smooth" })
    }

    // Render buttons/cards within the chatbot widget
    renderCards(cards) {
        return cards.map((card, i) => <Card key={i} payload={card.structValue}/>);
        }

    // Render a card with the correct style and parameters

    renderOneMessage(message, i) {
        if (message.msg && message.msg.text && message.msg.text.text) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text}/>;
        } else if(message.msg && message.msg.payload && message.msg.payload.fields && message.msg.payload.cards) {
            return <div key={i}>
                <div className="card-panel grey lighten-5 z-depth-1">
                    <div style={{overflow: 'hidden'}}>
                        <div className="col s2">
                            <a className="btn-floating btn-large waves-effect waves-light blue">{message.speaks}</a>
                        </div>

                        <div style={{overflow: 'auto', overflowY: 'scroll'}}>
                            <div style={{height: 300, width: message.msg.payload.fields.cards.listValue.values.length * 270}}>
                                {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }

        else {
            console.error('ERROR: renderOneMessage is not loading the cards properly. Please try again later.');
        }

        
    }

    renderMessages(stateMessages) {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                return this.renderOneMessage(message, i);
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