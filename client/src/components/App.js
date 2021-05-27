import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import About from './pages/About';
import Chatbot from './chatbot/Chatbot';
import FontysBackground from '../img/background-static-FontysPRO.png';

const App = () => (
        <div style={{ backgroundImage: FontysBackground}}>
            <BrowserRouter>
                <div className="container">
                    <Route exact path="/" component={Landing} />
                    <Route exact path="/about" component={About}/>
                    <Chatbot/>
                </div>
            </BrowserRouter>
        </div>
        ) 

export default App;