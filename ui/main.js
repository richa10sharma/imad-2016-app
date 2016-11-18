function loadLoginForm () {
    var loginHtml = `
        <div class=" row">
            <h4 class="col s12 m8 offset-m2">Login/Register</h4>
            <div class="col s12 m8 offset-m2">
                <div class="input-field col s6">
                <input placeholder="username" id="username" type="text" class="validate">
                <label for="username">Username</label> 
                </div>
            
                <div class="input-field col s6">
                <input placeholder="password" id="password" type="password" class="validate">
                <label for="password">Password</label> 
                </div>
            
                <input type="submit" id="login_btn" value="Login" class="waves-effect btn col s12 m2 offset-m3"/> &nbsp
                <input type="submit" id="register_btn" value="Register" class="waves-effect btn col s12 m2 offset-m2"/>
            </div>
        </div>
        `;
        //sssssss
    document.getElementById('login_area').innerHTML = loginHtml;
    
    // Submit username/password to login
    var submit = document.getElementById('login_btn');
    submit.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  submit.value = 'Sucess!';
              } else if (request.status === 403) {
                  submit.value = 'Invalid credentials. Try again?';
              } else if (request.status === 500) {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              } else {
                  alert('Something went wrong on the server');
                  submit.value = 'Login';
              }
              loadLogin();
          }  
          // Not done yet
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/login', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        submit.value = 'Logging in...';
        
    };
    
    var register = document.getElementById('register_btn');
    register.onclick = function () {
        // Create a request object
        var request = new XMLHttpRequest();
        
        // Capture the response and store it in a variable
        request.onreadystatechange = function () {
          if (request.readyState === XMLHttpRequest.DONE) {
              // Take some action
              if (request.status === 200) {
                  alert('User created successfully');
                  register.value = 'Registered!';
              } else {
                  alert('Could not register the user');
                  register.value = 'Register';
              }
          }
        };
        
        // Make the request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST', '/create-user', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({username: username, password: password}));  
        register.value = 'Registering...';
    
    };
}

function loadLoggedInUser (username) {
    
    var username = document.getElementById('username').value;
    var loginArea = document.getElementById('links');
    if(username == 'admin'){
    loginArea.innerHTML = ` <li><a>Hi ${username} </a></li>
     <li><a style="display:inline-block" href="/addarticle" id='adarticle'>Add Article</a> </li>
     <li><a style="display:inline-block" href="/logout" id='loogout'>Logout</a> </li>`;
    }
    else{
    loginArea.innerHTML = `<li><a>Hi ${username} </a></li>  <li><a style="display:inline-block" href="/logout" id='loogout'>Logout</a> </li>`;
    }
        
    }

function loadLogin () {
    // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                loadLoggedInUser(this.responseText);
            } else {
                loadLoginForm();
            }
        }
    };
    
    request.open('GET', '/check-login', true);
    request.send(null);
}

function loadArticles () {
        // Check if the user is already logged in
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var content = '<ul>';
                var articleData = JSON.parse(this.responseText);
                for (var i=0; i< articleData.length; i++) {
                    content += `<li>
                    <a href="/articles/${articleData[i].title}">${articleData[i].heading}
                  (${articleData[i].date.split('T')[0]}) </a> </li>`;
                }
                content += "</ul>"
                articles.innerHTML = content;
            } else {
                articles.innerHTML('Oops! Could not load all articles!')
            }
        }
    };
    
    request.open('GET', '/get-articles', true);
    request.send(null);
}


// The first thing to do is to check if the user is logged in!
loadLogin();

// Now this is something that we could have directly done on the server-side using templating too!
loadArticles();