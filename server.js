var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;

//var pool = new Pool(config);
var crypto = require('crypto');
var config = {

    user:'richa10sharma',
    databse:'richa10sharma',
    host:'http://db.imad.hasura-app.io/',
    port:'5432',
    password:process.env.DB_PASSWORD
};


var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});



function hash (input){
    //how to create a hash 
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return hashed.toString('hex');
    
}

app.get('/hash/:input',function(req, res)
{
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.get('/article-one', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
});

app.get('/article-two', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});
var pool = new Pool(config);
//-------------------------------------------------------------------------------
app.get('/article/article-two', function(req, res){
//    var articleName= req.params.articleName; 
//pool.query("SELECT * from test WHERE id = $1",[req.params.article], function(err,result)
   pool.query("SELECT * from test WHERE id = '"+req.params.articleName+"'", function(err,result){
       
       if(err){
           res.status(500).send(err.toString());
       }
       
       else{
           if(result.rows.length ===0){
               res.status(404).send('article not found');
               }
               else{
                   
                   var articleData= result.rows[0];
                   res.send(createTemplate(articleData));
               }
           
       }
   });   
    
});

app.get('/article-one', function(req, res){
    req.send('Article three requested and will be send here');
});
app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});
app.get('/test-db',function(req, res){
    //make a select request
    //return a response
    pool.query('SELECT * FROM test', function(err,result){
        if(err){
        res.status(500).send(err.toString());
            
        }
        else{
            res.send('JSON',stringify(result.rows));
        }
    });
    
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
