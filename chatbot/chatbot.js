'use strict'
const dialogflow = require('dialogflow');
const config = require('../config/keys');
const { struct } = require('pb-util');

const projectID = config.googleProjectID;
const sessionID = config.dialogFlowSessionID;
// Credentials from dev.js
const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
}

// Init the sessionClient
const sessionClient = new dialogflow.SessionsClient({projectID, credentials});

// Set parameters from Dialogflow Fontys PRO Chatbot project


module.exports = {
    textQuery: async function(text, userID, parameters = {}) {
        let sessionPath = sessionClient.sessionPath(projectID, sessionID + userID);
        let self = module.exports;
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: text,
                // The language used by the client (en-US)
                languageCode: config.dialogFlowSessionLanguageCode,
            },
            },
            queryParams: {
                payload: {
                    data: parameters
                }
            }
        };

        let responses = await sessionClient.detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
         },

    eventQuery: async function(event, userID, parameters = {}) {
            let self = module.exports;
            let sessionPath = sessionClient.sessionPath(projectID, sessionID + userID);
            // The text query request.
            const request = {
                session: sessionPath,
                queryInput: {
                event: {
                    // The query to send to the dialogflow agent
                    name: event,
                    parameters: struct.encode(parameters),
                    // The language used by the client (en-US)
                    languageCode: config.dialogFlowSessionLanguageCode,
                },
                }
            };
    
            let responses = await sessionClient.detectIntent(request);
            responses = await self.handleAction(responses);
            return responses;
             },

         handleAction: function(responses) {
             return responses;
         }
}