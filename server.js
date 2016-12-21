
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'richa10sharma',
    database: 'richa10sharma',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
//---
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
   <!doctype html>
<html>
    <head>
        <link type="text/css" rel="stylesheet" href="/ui/materialize.min.css"  media="screen,projection"/>
        
           <link href="ui/fusion_style.css" type="text/css" rel="stylesheet">
           <link href="/ui/style.css" rel="stylesheet" />
    </head>
    <body>
        
         <header>
            <nav>
                
                  <a href="/" class="brand-logo">Avalanche</a>
                  <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>
                  <ul class="right hide-on-med-and-down" id='login_area' >
                        
                  </ul>
             
            </nav>
        </header>
        
        <div class="sidebar">
            <ul id="slide-out" class="side-nav fixed">
                <h5><font color="white">My Articles</font></h5>
                <div id="articles">
                <center>Loading articles....</center>
                </div>
                
            </ul>
        </div>
     
     
     
              
      <div class="main-container " >
          
		<div class="center">
          <div class="container">
              
              <center>
              <h3>
                  ${heading}
              </h3>
              <div>
                  ${date.toDateString()}
              </div>
              <div>
                ${content}
              </div>
              </center>
              <hr/>
             
             
             <div id="comment_form">
              </div>
              <h6>Previous Comments (Register to comment)</h6>
              <div id="comments">
              Loading comments...
              </div>
              
               
          </div>
		  </div>
		  </div>
           <script src="ui/jquery-3.1.1.min.js"></script>
            <!--Import jQuery before materialize.js-->
            <script type="text/javascript" src="ui/materialize.min.js">
            </script>
    
        
       <script type="text/javascript" src="/ui/main.js">
        </script>
        <script type="text/javascript" src="/ui/article.js">
        </script>
        
      </body>
    </html>
    `;
    return htmlTemplate;

}
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});


app.get('/image', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'cover.png'));
});

app.get('/fbt', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'fbt.png'));
});

app.get('/tweety2', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'tweety2.png'));
});
function hash (input, salt) {
    // How do we create a hash?
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

//---
app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if(!username.trim() || !password.trim() || username.length>32 || password.length>32){
      res.status(400).send('Cannot leave username or password blank.Please Enter Username/Password:(Upto 32 chars)')
  } 
  else if(!/^[a-zA-Z0-9_.@]+$/.test(username)){  //If username contains other than a-z,A-Z,0-9,@._ then send error.
      res.status(500).send("Username can't contain special characters except _.@");
  }
  else{
        var salt = crypto.randomBytes(128).toString('hex');
        var dbString = hash(password, salt);
        pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString],         function (err, result) {
           if(err) {
              res.status(500).send(err.toString());
           } else {
              res.send('User successfully created: ' + username);
           }
        });
    }
});
//--
app.post('/login',function(req,res){
  var username=req.body.username;
 var password=req.body.password;
 if(!username.trim() || !password.trim() || username.length>32 || password.length>32){
      res.status(400).send('Cannot leave username or password blank.Please Enter Username/Password:(Upto 32 chars)')
 }
 else if(!/^[a-zA-Z0-9_ .@]+$/.test(username)){  //If username contains other than a-z,A-Z,0-9,@._BLANKSPACE then send error.
    res.status(500).send("Username can't contain special characters except _.@");
}
else{
   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (result.rows.length === 0) {
              res.status(403).send('username/password is invalid');
          } else {
              // Match the password
              var dbString = result.rows[0].password;
              var salt = dbString.split('$')[2];
              var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
              if (hashedPassword === dbString) {
                
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                
                res.send('credentials correct!');
                
              } 
              
              else {
                res.status(403).send('username/password is invalid');
              }
          
          }
        }
      
   });
}
});

app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
    res.sendFile(path.join(__dirname, 'ui', 'index.html'));
   
});

var pool = new Pool(config);

app.get('/get-articles', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id = "user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!')
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

//------------------------------add article------------------------------

app.get('/addarticle', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'addarticlee.html'));
});


app.post('/submit-article', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
       
               pool.query(
                    "INSERT INTO comment (title, heading, content, date) VALUES ($1, $2, $3, $4)", [req.body.title, req.body.heading, req.body.content, req.body.date],function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Article Added!')
                            }
                        });     
    }
    else {
        res.status(403).send('Only logged in users can comment');
    }
});



//---------------------------------------------------------------
app.get('/articles/:articleName', function (req, res) {
  // SELECT * FROM article WHERE title = '\'; DELETE WHERE a = \'asdf'
  pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(createTemplate(articleData));
        }
    }
  });
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
