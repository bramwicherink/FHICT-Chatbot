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
        // handleInputKeyPress registreert of het invoerveld (voor vragen) al dan niet is geselecteerd of een waarde heeft (ingetypte tekst) 
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this._handleInputButtonPress = this._handleInputButtonPress.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        // Definiëren van de state en eigenschappen die later in de code gebruikt kunnen worden
        this.state = {
            messages: [],
            showBot: false,
            // disableInput kijkt naar of het invoerveld al dan niet uitgeschakeld dient te worden
            disableInput: false,
            // typingIndicator kijkt naar of er vanuit de API responses komen 
            typingIndicator: false
        }
        // Zorgt voor een unieke userID waarmee iedere keer dat de pagina herladen wordt een andere sessie gestart wordt. Dit is benodigd voor Dialogflow zodat de verschillende sessies o.a. opgeslagen kunnen worden ter analyse van iedere dialoog.
        if (cookies.get('userID') === undefined) {
            cookies.set('userID', uuid(), { path: '/' });
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
        try {
            const res = await axios.post('api/df_text_query', { text: queryText, userID: cookies.get('userID') });
            for (let msg of res.data.fulfillmentMessages) {

                says = {
                    speaks: 'bot',
                    msg: msg
                }
                // Kleine vertraging om de conversatie zo natuurlijk mogelijk te laten aanvoelen -> vanuit chatbot
                await new Promise(resolve => setTimeout(resolve, 1100));
                this.setState({ typingIndicator: true })
                this.setState({ messages: [...this.state.messages, says] });
            }
            this.setState({ disableInput: !this.state.disableInput });
            this.setState({ typingIndicator: false });

        }

        // Wanneer de chatbotwidget geen verbinding kan maken met de Dialogflow API services, geeft deze een foutmelding middels catch statement weer. 
        catch (e) {
            says = {
                speaks: 'bot',
                msg: {
                    text: {
                        text: 'Sorry! Ik krijg momenteel helaas geen verbinding en kan helaas niet met je chatten.. Probeer het over enkele minuten opnieuw. Dank je! De chatbot wordt nu afgesloten.'
                    }
                }
            }
            // Wanneer chatbotwidget geen verbinding krijgt, zal de chatbot na 2000ms = 2 seconden dichtklappen
            this.setState({ messages: [...this.state.messages, says] });
            let that = this;
            setTimeout(function () {
                that.setState({ showBot: false });
            }, 2000);

        }

        // Checkt voor iedere 'message' of het vanuit de 'bot' of 'user' komt. 

    };


    // Checkt voor bepaalde events vanuit Dialogflow 
    async df_event_query(event) {
        const res = await axios.post('api/df_event_query', { event, userID: cookies.get('userID') })

        for (let msg of res.data.fulfillmentMessages) {

            let says = {
                speaks: 'bot',
                msg: msg
            }
            this.setState({ messages: [...this.state.messages, says] });
        }
    }
    // Wanneer component/pagina volledig gerenderd is, zal het event 'Welcome' vanuit Dialogflow gestart worden. Dit zorgt voor het weergeven van het welkomstbericht.
    componentDidMount() {
        this.df_event_query('Welcome');
    }
    // Wanneer er iedere keer een bericht wordt gestuurd of ontvangen wordt in de chatbotwidget, scrollt de widget automatisch mee met het laatstgestuurde bericht
    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behaviour: "smooth" })
    }
    // Wanneer de chatbotknop state 'hide' geklikt wordt, wordt er een show methode aangeroepen die ervoor zorgt dat de chatbotwidget daadwerkelijk weergegeven wordt
    show(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ showBot: true });
    }
    // Wanneer de chatbotknop state 'open' geklikt wordt, wordt er een show methode aangeroepen die ervoor zorgt dat de chatbotwidget daadwerkelijk gesloten wordt
    hide(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ showBot: false });
    }

    // Zorgt voor het renderen van de cards wanneer deze aangeroepen worden vanuit de API
    renderCards(cards) {
        return cards.map((card, i) => <Card key={i} payload={card.structValue} />);
    }

    // Zorgt voor het opmaken van de card met correcte stijl 

    renderOneMessage(message, i) {
        if (message.msg && message.msg.text && message.msg.text.text) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
        }
        else if (message.msg && message.msg.payload && message.msg.payload.fields && message.msg.payload.fields.cards) {
            return <div key={i} style={{ overflow: 'scroll hidden' }}>
                <div className="card card-fontys">
                    <div style={{ overflow: 'scroll hidden' }}>
                    </div>
                    <div style={{ overflow: 'scroll hidden', marginBottom: '30px' }}>
                        <div style={{ height: '100%', width: message.msg.payload.fields.cards.listValue.values.length * 270, display: 'flex', overflow: 'auto scroll'}}>
                            {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                        </div>
                    </div>
                </div>
            </div>
        }

    }
    // Methode die renderCards & renderOneMessage samen pakt en zorgt voor de weergave
    renderMessages(stateMessages) {
        if (stateMessages) {
            return stateMessages.map((message, i) => {
                return this.renderOneMessage(message, i);
            });
        } else {
            return null;
        }
    }

    // Zorgt voor het disablen en enablen van het invoerveld, zolang er berichten vanuit de chatbot zelf worden verzonden, om een overload aan berichten van de potential/user/gebruiker te voorkomen

    _handleInputKeyPress(e) {
        if (e.key === 'Enter' || e.onClick) {
            this.df_text_query(e.target.value);
            e.target.value = '';
            this.setState({ disableInput: !this.state.disableInput });

        }
    }

    _handleInputButtonPress(e) {
        if(document.getElementById('chatbotInput').value !== '') {
        var inputFieldQuestion = document.getElementById('chatbotInput').value;
        
        this.df_text_query(inputFieldQuestion);
        document.getElementById('chatbotInput').value = '';
        this.setState({ disableInput: !this.state.disableInput });
        }
    }



    // Zorgt voor het daadwerkelijk renderen van de elementen bij elkaar

    render() {
        // Wanneer de state showBot 'true' is, dus wanneer de chatbotwidget geopend is
        if (this.state.showBot) {
            // Wanneer de chatbot zelf aan het typen is en de typingIndicator (true) verschijnt
            if (this.state.typingIndicator) {
                // Laat dit weergeven: 
                return (
                    <div>
                        <button id="toggleChatbot-open" onClick={this.hide}><img alt="X" src={"https://chatbot-fhict.bramwicherink.nl/images/letter-x.svg"}></img></button>

                        <div className="chatbotWidget-wrapper" style={{ position: 'fixed', display: 'flex', right: '10vw', float: 'right', height: '100%', width: 'auto', top: '7%' }}>
                            <div className="chatbotWidget">
                                <div className="chatbotWidget-header">
                                    <h2>Chatbot Floris</h2>
                                    <p>Ik help je graag als je vragen hebt!</p>
                                </div>
                                <div className="messageBox">

                                    {this.renderMessages(this.state.messages)}
                                    <div className="message-typing-indicator-container" ref={(el) => { this.messagesEnd = el; }} style={{ float: 'left', clear: 'both' }}>
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>

                                    </div>



                                </div>

                                <div className="inputField">

                                <input type="text" id="chatbotInput"

                                    style={{
                                        height: '100%', width: '95%',
                                        backgroundColor: '#FFFFFF', boxShadow: '0px 4px 24px rgba(0, 0,0, 0.08',
                                        border: 'none', color: '#484848', paddingLeft: '5%',
                                        fontSize: '16px', right: '0', bottom: '0',
                                        float: 'bottom', position: 'sticky'
                                    }}

                                    placeholder="Typ je vraag hier..."
                                    disabled={this.state.disableInput}
                                    onKeyPress={this._handleInputKeyPress}></input>

<input className="arrowIcon" type="image" style={{ float: 'bottom', position: 'sticky' }} src="https://chatbot-fhict.bramwicherink.nl/images/arrow.svg" onClick={this._handleInputButtonPress} disabled={this.state.disableInput}></input>

                                </div>

                            </div>
                        </div>
                    </div>
                )
            }
            return (
                <div>
                    <button id="toggleChatbot-open" onClick={this.hide}><img alt="X" src={"https://chatbot-fhict.bramwicherink.nl/images/letter-x.svg"}></img></button>

                    <div className="chatbotWidget-wrapper" style={{ position: 'fixed', display: 'flex', right: '10vw', float: 'right', height: '100%', width: 'auto', top: '7%' }}>
                        <div className="chatbotWidget">
                            <div className="chatbotWidget-header">
                                <h2>Chatbot Floris</h2>
                                <p>Ik help je graag als je vragen hebt!</p>
                            </div>
                            <div className="messageBox">
                                {this.renderMessages(this.state.messages)}
                                <div ref={(el) => { this.messagesEnd = el; }} style={{ float: 'left', clear: 'both' }}>

                                </div>

                            </div>

                            <div className="inputField">

                                <input type="text" id="chatbotInput"

                                    style={{
                                        height: '100%', width: '95%',
                                        backgroundColor: '#FFFFFF', boxShadow: '0px 4px 24px rgba(0, 0,0, 0.08',
                                        border: 'none', color: '#484848', paddingLeft: '5%',
                                        fontSize: '16px', right: '0', bottom: '0',
                                        float: 'bottom', position: 'sticky', cursor: 'pointer'
                                    }}

                                    placeholder="Typ je vraag hier..."
                                    disabled={this.state.disableInput}
                                    onKeyPress={this._handleInputKeyPress}></input>



                                <input className="arrowIcon" type="image" style={{ float: 'bottom' }} src="https://chatbot-fhict.bramwicherink.nl/images/arrow.svg" onClick={this._handleInputButtonPress} disabled={this.state.disableInput}></input>


                            </div>



                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div>
                    <button id="toggleChatbot-open" onClick={this.show}><img alt="Open" src={"https://chatbot-fhict.bramwicherink.nl/images/floris-icon.svg"}></img></button>
                    <div ref={(el) => { this.messagesEnd = el; }} style={{ float: 'left', clear: 'both' }}>

                    </div>
                </div>

            )
        }
    }
}

export default Chatbot;

