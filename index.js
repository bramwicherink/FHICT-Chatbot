const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

require('./routes/dialogFlowRoutes')(app);

if (process.env.NODE_ENV === 'production') {
    // JS EN CSS IN HEROKU 
    app.use(express.static('client/build'));

    // INDEX.HTML FOR ALL ROUTING 
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT); 