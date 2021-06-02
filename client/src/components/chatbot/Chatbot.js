import React, { Component } from 'react';
import axios from 'axios/index';
import Message from './Message';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';
import Card from './Card';
import '../../App.css';

const cookies = new Cookies();

class Chatbot extends Component {   

    messagesEnd; 
    // Initialiseert de data component
    constructor(props) {
        super(props);
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);   
        this.state = {
            messages: [],
            showBot: false
        }

        if(cookies.get('userID') === undefined) {
        cookies.set('userID', uuid(), {path: '/'});
        }
    }

    // Functie die zorgt voor het juist weergeven van de tekst in de chatbotwidget
    // Text verwerking
    async df_text_query(queryText) {

        // Data initialisatie
        let says = {
            speaks: 'user',
            msg: {
                text: {
                    text: queryText
                }
            }
        }
        // Zorgt voor het juist weergeven van de data
        this.setState({ messages: [...this.state.messages, says] });
        // Opvragen van gegevens in de backend / API vanuit Dialogflow
        const res = await axios.post('api/df_text_query', { text: queryText, userID: cookies.get('userID') })

        // Checkt voor iedere 'message' of het vanuit de 'bot' of 'user' komt. 
        for(let msg of res.data.fulfillmentMessages) {
            
            says = {
                speaks: 'bot',
                msg: msg
            }
            // Kleine vertraging om de conversatie zo natuurlijk mogelijk te laten aanvoelen -> vanuit chatbot
            await new Promise(resolve => setTimeout(resolve, 900));    
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

    show() {
        this.setState({showBot: true});
    }

    hide() {
        this.setState({showBot: false});
    }

    // Render buttons/cards within the chatbot widget
    renderCards(cards) {
        return cards.map((card, i) => <Card key={i} payload={card.structValue}/>);
        }

    // Render a card with the correct style and parameters

    renderOneMessage(message, i) {
        if(message.msg && message.msg.text && message.msg.text.text) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
        }
        else if(message.msg && message.msg.payload && message.msg.payload.fields && message.msg.payload.fields.cards) {
            return  <div key={i}>
                <div className="card card-fontys">
                    <div style={{overflow: 'hidden'}}>
                    </div>
                 <div style={{overflow: 'auto', overflowY: 'scroll'}}>
                     <div style={{height: 260, width: message.msg.payload.fields.cards.listValue.values.length * 270, display: 'flex'}}>
                        {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                     </div>
                 </div>
                </div>
            </div>
        }

    }

    renderMessages(stateMessages) {
        if(stateMessages) {
            return stateMessages.map((message, i) => {
                return this.renderOneMessage(message, i);
            });
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
        if(this.state.showBot) {
        return (
        <div>
            <button id="toggleChatbot-open" onClick={this.hide}><img src={"http://chatbot-fhict.bramwicherink.nl/images/letter-x.svg"}></img></button>
           
          <div style={{height: 800, width: 400, float: 'right'}}>
              <div className="chatbotWidget">
                  <div className="chatbotWidget-header">
                  <h2>Chatbot Carl</h2>
                  <p>Ik help je graag als je vragen hebt!</p>
                  </div>
                  <div className="messageBox">
                  {this.renderMessages(this.state.messages)}
                  <div ref={(el) => { this.messagesEnd = el; }} style={{float: 'left', clear: 'both'}}>

                  </div>

                  </div>
                  <input type="text" 

                  style={{height: '10%', width: '95%', 
                  backgroundColor: '#FFFFFF', boxShadow: '0px 4px 24px rgba(0, 0,0, 0.08', 
                  border: 'none', color: '#484848', paddingLeft: '5%',
                  float: 'left', fontSize: '16px', position: 'absolute', right: '0', bottom: '0',
                  float: 'bottom', position: 'sticky'}} 
                  
                  placeholder="Typ je vraag hier..." 
                  
                  onKeyPress={this._handleInputKeyPress}></input>
              </div>
          </div>  
        </div>
        )
      }
      else {
        return (
            <div>
            <button id="toggleChatbot-open" onClick={this.show}><img src={"http://chatbot-fhict.bramwicherink.nl/images/chat.svg"}></img></button>
            <div ref={(el) => { this.messagesEnd = el; }} style={{float: 'left', clear: 'both'}}>

                  </div>
            </div>
            
          )
      }
    }
}

export default Chatbot;

