export default function Session() {
    
    this.signedIn = false;
    this.idToken  = -1;
    
}

Session.prototype = {

    attachSignin: function(element) {

        let auth2 = window.gapi.auth2.getAuthInstance();
        console.log("sign in attached");
        auth2.attachClickHandler(element, {}, () => {
            console.log("click");
            this.onSignIn(auth2.currentUser.get().getAuthResponse());
        }, function(error) {
            alert(JSON.stringify(error, undefined, 2));
        });

    },

    onSignIn: function(authResponse) {

        this.idToken = authResponse.id_token;
        this.signIn();
        this.sendId();

    },

    signIn: function() {

        this.signedIn = true;
        $('div.signin').hide();
        $('div.signout').show();
        $('form#course-upload').show();

    },

    signOut: function() {

        this.signedIn = false;
        $('div.signin').show();
        $('div.signout').hide();
        $('form#course-upload').hide();
        let auth2 = window.gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
        });
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/signout');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4)
                if (xhr.status === 200) {
                    let completed = document.querySelectorAll('img.completed');
                    for (let i = 0; i < completed.length; i++) {
                        completed.setAttribute("src", "/img/uncompleted.png")
                    }
                    let starred = document.querySelectorAll('img.completed');
                    for (let i = 0; i < starred.length; i++) {
                        starred.setAttribute("src", "/img/unstarred.png")
                    }
                }
        };
        xhr.send('idtoken=' + this.idToken);

    },

    sendId: function() {

        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/tokensignin');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.timeout = 10000;
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4)
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    this.signedIn = true;
                    $('div.signout').show();
                    if (!!data.userId) {
                        window.userId = data.userId;
                    }
                    if (!!window.courses && !!window.courses.courses) {
                        if (!!data.completed) {
                            for (let i = 0; i < data.completed.length; i++) {
                                if (!!window.courses.courses[data.completed[i]]) {
                                    window.courses.courses[data.completed[i]].completedself = 1;
                                    let obj = document.querySelector(`div.course-template[course-id="${data.completed[i]}"]`);;
                                    if (!!obj) {
                                        obj.querySelector('img.completed').setAttribute("src", "/img/completed.png");
                                    }
                                }
                            }
                        }
                        if (!!data.starred) {
                            for (let i = 0; i < data.starred.length; i++) {
                                if (!!window.courses.courses[data.starred[i]]) {
                                    window.courses.courses[data.starred[i]].starredself = 1;
                                    let obj = document.querySelector(`div.course-template[course-id="${data.starred[i]}"]`);
                                    if (!!obj) {
                                        obj.querySelector('img.starred').setAttribute("src", "/img/starred.png");
                                    }
                                }
                            }
                        }
                    }
                } else {
                    console.log(xhr.responseText);
                }
        };
        xhr.ontimeout = () => {
            console.log("Server timed out");
        };
        xhr.send('idtoken=' + this.idToken);

    }

};