var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');
//var pool = new Pool(config);
var crypto = require('crypto');
var config = {

    user:'richa10sharma',
    databse:'richa10sharma',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password: process.env.DB_PASSWORD
};


var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});





app.get('/article-one', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
});

app.get('/article-two', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});

//-------------------------------------------------------------------------------


app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var pool = new Pool(config);
//---------------CREATE USER----------------------
app.post('create-user', function (req, res) {
  
  var username = req.body.username;
  var password = req.body.password;
  var salt = crypto.randomBytes(128).toString('hex');
  var dbString = hash(Password,salt);
  
  pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function(err, result){
        if(err){
        res.status(500).send(err.toString());
            
        }
        else{
            res.send('user successfully created: '+ username);
        }
    });
  
});

//------------------------------------LOGIN CHECK------------------------

app.post('/login', function (req, res) {
  
  var username = req.body.username;
  var password = req.body.password;
  
  pool.query('SELECT * FROM "user" WHERE username = $1', [username], function(err, result){
        if(err){
        res.status(500).send(err.toString());
            
        }
        else{
            if(result.rows.length ===0){
                  res.status(403).send('username password is invalid');
            }
            
            else{
                
                var dbString = result.rows[0].password;
                //var hashedPassword = hash(password, salt);
                if(password == dbString){
                   res.send('credentials are correct '); 
                }
                else{
                    
                     res.status(403).send('username password is invalid');
                }
            }
            
        }
    });
  
});

//--------------------------------------------------TEST DB---------------------
app.get('/test-db',function(req, res){

    pool.query('SELECT * FROM test', function(err, result){
        if(err){
        res.status(500).send(err.toString());
            
        }
        else{
            res.send(JSON.stringify(result.rows));
        }
    });
    
});

//-------------------------------HASHING_____________________________
function hash (input, salt){
    //how to create a hash 
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return hashed.toString('hex');
   // return ["pbkdf2","10000", salt, hashed.toString('hex')].join("$");
          
    
}

	
	app.get('/hash/:input',function(req, res)// we took it to be /hash/:input we took ':' because we wanted to make the input as a part of URL 
        {
           var hashedString = hash(req.params.input, 'this-is-some-random-string');
           res.send(hashedString);
            });


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
