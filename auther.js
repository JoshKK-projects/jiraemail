    window.onload = function(){
      
      var CLIENT_ID = '489989846201-8nms7c7t33mhc0i45lvksgrt996i29q4.apps.googleusercontent.com';

      var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://mail.google.com/'];
      

      handleAuthClick();

      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          authorizeDiv.style.display = 'none';
          loadGmailApi();
        } else {
          authorizeDiv.style.display = 'inline';
        }
      }

      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      function loadGmailApi() {
        gapi.client.load('gmail', 'v1', listLabels);
      }

      function listLabels() {
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'q':'[JIRA]',
          'labelIds':'UNREAD'
        });

        request.execute(function(resp) {
          console.log(resp);
           var id_list = resp.messages;
           for(var id in id_list){
              var m_id = id_list[id].id;
              var req = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id':m_id
              });
              req.execute(function(res){
                var str = res.payload.parts[0].body.data.replace(/\-/g, '+').replace(/\_/g, '/');
                var raw = atob(str);
                appendEmail(raw,m_id);
              });

           }
           
        });
        
      }


      function appendEmail(message,id) {
        var div = document.getElementById('email-div');
        div.innerHTML += "<div class='single-email grid-item' id='email-"+id+"'>"+message+"<button class='read' id='"+id+"' value="+id+">Mark as Read</button><hr></div>";
      }
      $('#email-div').on('click','.read',function(e){
        var id = $(this).context.id;
        var req = gapi.client.gmail.users.messages.modify({
          'userId': 'me',
          'id': id,
          resource:{
            'removeLabelIds': ['UNREAD']            
          }
        });
        req.execute(function(resp){
          console.log(resp);
          var hide_div = '#email-'+id;
          $(hide_div).css('display','none');
        });

      });

    }