const express = require('express');
const mrz = require('mrz-gen');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.post('/api/mrz/generate', (req, res) => {
    const code = mrz.generate({user:req.body});
    res.send({code});
});

app.listen(port, () => console.log(`Listening on port ${port}`));

