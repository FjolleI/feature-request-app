// Populating Admin Table
$('.manage-admins-link').click(function() {
   $('.admin-table').html("");
   $.ajax({
      url: '/api/user/',
      method: 'GET',
      contentType: 'application/json',
      data: { role: 'admin', status: 'True' },
      headers: {"x-access-token": localStorage.getItem('token')},
      success: function(res) {
         if (res != '') {
            res.map(client => {
               $('.admin-table').append("<tr>\
               <td>"+ client.first_name +"</td>\
               <td>"+ client.last_name +"</td>\
               <td>"+ client.username +"</td>\
               <td>"+ client.email_address +"</td>\
               <td>"+ client.company +"</td>\
               </tr>");
            });
         }
      }
   });
});

ko.validation.rules.pattern.message = 'Invalid.';
ko.validation.init({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null
}, true);

var mustEqual = function(val, other) {
   return val == other;
};

$('.add-admin-link').click(function() {
  console.log('clicked');
  ko.cleanNode(document.getElementById('admin-form'));
  var signUpAdminViewModel = {
     firstName: ko.observable("").extend({required: true}),
     lastName: ko.observable("").extend({required: true}),
     username: ko.observable("").extend({required: true, minLength: 5, maxLength: 20}),
     emailAddress: ko.observable("").extend({required: true, email: true}),
     company: ko.observable("").extend({required: true}),
     password: ko.observable("").extend({minLength: 6}),
     confirmPassword: ko.observable(""),
     submit: function() {
        if (signUpAdminViewModel.errors().length === 0) {
           var jsonData = {
              first_name: this.firstName(),
              last_name: this.lastName(),
              username: this.username(),
              email_address: this.emailAddress(),
              company: this.company(),
              password: this.password(),
              confirm_password: this.confirmPassword()
           };

           $.ajax({
              method: 'POST',
              url: '/api/user/add/admin',
              contentType: 'application/json',
              dataType: 'json',
              data: JSON.stringify(jsonData),
              headers: {"x-access-token": localStorage.getItem('token')},
              beforeSend: function() {
                swal({
                  title: "In progress!",
                  text: "Sending the email!",
                  icon: "info",
                  buttons: false
                });
              },
              success: function(data) {
                 if(data.message == 'Username is taken!') {
                    $('.username-err').html('This ' + data.message.toLowerCase());
                 } else if (data.message == 'This email is taken!') {
                   $('.email-err').html(data.message);
                 } else if (data.message == 'Password and Confirm Password do not match!') {
                    $('.pass-up-err').html(data.message);
                 } else {
                    swal("Success!", "Admin has been successfully saved!", "success")
                       .then(function() {
                          $('#add-admin-modal').modal('hide');
                          $('#admin-form').trigger('reset');
                          $('.admin-table').append("<tr>\
                             <td>"+ jsonData.first_name +"</td>\
                             <td>"+ jsonData.last_name +"</td>\
                             <td>"+ jsonData.username +"</td>\
                             <td>"+ jsonData.email_address +"</td>\
                             <td>"+ jsonData.company +"</td>\
                          </tr>");
                       });
                 }
              }
           })
        }
        else {
           signUpAdminViewModel.errors.showAllMessages();
        }
     }
  };

  signUpAdminViewModel.confirmPassword = ko.observable().extend({
     validation: {
        validator: mustEqual,
        message: 'Passwords do not match.',
        params: signUpAdminViewModel.password
     }
  });

  signUpAdminViewModel.errors = ko.validation.group(signUpAdminViewModel);

  signUpAdminViewModel.requireLocation = function() {
     signUpAdminViewModel.location.extend({required: true});
  };

  ko.applyBindings(signUpAdminViewModel, document.getElementById('admin-form'));
});

$('#add-admin-modal').on('hidden.bs.modal', function () {
  $('.validationMessage').hide();
});

$('#username-admin').keyup(function() {
   $('.username-err').html('');
});

$('#email-address').keyup(function() {
   $('.email-err').html('');
});
