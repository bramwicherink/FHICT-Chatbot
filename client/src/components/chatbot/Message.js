import React from 'react';
import '../../App.css'

const Message = (props) => (
    
    
        // <div className="card-panel grey lighten-5 z-depth-1">
            <div className="row valign-wrapper">
              <div className="messageBoxContainer">  
                {props.speaks==='bot' && 
                // Show avatar of bot
                <div className="chatbotAnswer">
                    <div className="col s10">
                        <span className="whitetext">
                            {props.text}
                        </span>
                    </div>
                
                </div>
                }

           

                {props.speaks==='user' && 
                // Show avatar of 'Ik/Me'
                <div className="userAnswer">
                    <div className="col s10">
                        <span className="whitetext">
                            {props.text}
                        </span>
                    </div>
                
                </div>
                }

            </div>
        
        </div>
);

export default Message;