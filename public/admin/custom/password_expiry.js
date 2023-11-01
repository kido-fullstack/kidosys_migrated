$(document).ready(function() {
  $('#popover-password-top').hide();
  $('.sub_btn').attr("disabled", true);
  // $('#email').blur(function() {
  //     var email = $('#email').val();
  //     if (IsEmail(email) == false) {
  //         $('#sign-up').attr('disabled', true);
  //         $('#popover-email').removeClass('hide');
  //     } else {
  //         $('#popover-email').addClass('hide');
  //     }
  // });

  $('#password').keyup(function() {
      var password = $('#password').val();
      if (checkStrength(password) == false) {
        $('.sub_btn').attr("disabled", true);
      }

        if ($('#password').val() !== $('#confirm-password').val()) {
            $('#popover-cpassword').removeClass('hide');
            // $('#sign-up').attr('disabled', true);
            $('.sub_btn').attr("disabled", true);
        } else {
            $('#popover-cpassword').addClass('hide');
            if (checkStrength(password) == "Strong") {
              $('.sub_btn').attr("disabled", false);
            } else {
              $('.sub_btn').attr("disabled", true);
            }
        }
  });

  $('#confirm-password').keyup(function() {
      // if ($('#password').val() !== $('#confirm-password').val()) {
      //     $('#popover-cpassword').removeClass('hide');
      //     // $('#sign-up').attr('disabled', true);
      //     $('.sub_btn').attr("disabled", true);
      // } else {
      //     $('#popover-cpassword').addClass('hide');
      // }

      if ($('#password').val() !== $('#confirm-password').val()) {
          $('#popover-cpassword').removeClass('hide');
          // $('#sign-up').attr('disabled', true);
          $('.sub_btn').attr("disabled", true);
      } else {
          $('#popover-cpassword').addClass('hide');
          if (checkStrength($('#password').val()) == "Strong") {
            $('.sub_btn').attr("disabled", false);
          } else {
            $('.sub_btn').attr("disabled", true);
          }
      }
  });
  // $('#contact-number').blur(function() {
  //     if ($('#contact-number').val().length != 10) {
  //         $('#popover-cnumber').removeClass('hide');
  //         $('#sign-up').attr('disabled', true);
  //     } else {
  //         $('#popover-cnumber').addClass('hide');
  //         $('#sign-up').attr('disabled', false);
  //     }
  // });
  // $('#sign-up').hover(function() {
  //     if ($('#sign-up').prop('disabled')) {
  //         $('#sign-up').popover({
  //             html: true,
  //             trigger: 'hover',
  //             placement: 'below',
  //             offset: 20,
  //             content: function() {
  //                 return $('#sign-up-popover').html();
  //             }
  //         });
  //     }
  // });

  function IsEmail(email) {
      var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!regex.test(email)) {
          return false;
      } else {
          return true;
      }
  }

  function checkStrength(password) {
      var strength = 0;


      //If password contains both lower and uppercase characters, increase strength value.
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
          strength += 1;
          $('.low-upper-case').addClass('text-success');
          $('.low-upper-case i').removeClass('fa-file-text').addClass('fa-check');
          // $('#popover-password-top').addClass('hide');
          $('#popover-password-top').hide();
      } else {
          $('.low-upper-case').removeClass('text-success');
          $('.low-upper-case i').addClass('fa-file-text').removeClass('fa-check');
          // $('#popover-password-top').removeClass('hide');
          $('#popover-password-top').show();
      }

      //If it has numbers and characters, increase strength value.
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
          strength += 1;
          $('.one-number').addClass('text-success');
          $('.one-number i').removeClass('fa-file-text').addClass('fa-check');
          // $('#popover-password-top').addClass('hide');
          $('#popover-password-top').hide();

      } else {
          $('.one-number').removeClass('text-success');
          $('.one-number i').addClass('fa-file-text').removeClass('fa-check');
          // $('#popover-password-top').removeClass('hide');
          $('#popover-password-top').show();
      }

      //If it has one special character, increase strength value.
      if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
          strength += 1;
          $('.one-special-char').addClass('text-success');
          $('.one-special-char i').removeClass('fa-file-text').addClass('fa-check');
          // $('#popover-password-top').addClass('hide');
          $('#popover-password-top').hide();

      } else {
          $('.one-special-char').removeClass('text-success');
          $('.one-special-char i').addClass('fa-file-text').removeClass('fa-check');
          // $('#popover-password-top').removeClass('hide');
          $('#popover-password-top').show();
      }

      if (password.length > 7) {
          strength += 1;
          $('.eight-character').addClass('text-success');
          $('.eight-character i').removeClass('fa-file-text').addClass('fa-check');
          // $('#popover-password-top').addClass('hide');
          $('#popover-password-top').hide();

      } else {
          $('.eight-character').removeClass('text-success');
          $('.eight-character i').addClass('fa-file-text').removeClass('fa-check');
          // $('#popover-password-top').removeClass('hide');
          $('#popover-password-top').hide();
      }




      // If value is less than 2

      if (strength < 2) {
          $('#result').removeClass()
          $('#password-strength').addClass('progress-bar-danger');

          $('#result').addClass('text-danger').text('Very Weak');
          $('#password-strength').css('width', '10%');
      } else if (strength == 2) {
          $('#result').addClass('good');
          $('#password-strength').removeClass('progress-bar-danger');
          $('#password-strength').addClass('progress-bar-warning');
          $('#result').addClass('text-warning').text('Weak')
          $('#password-strength').css('width', '60%');
          return 'Weak'
      } else if (strength == 4) {
          $('#result').removeClass()
          $('#result').addClass('strong');
          $('#password-strength').removeClass('progress-bar-warning');
          $('#password-strength').addClass('progress-bar-success');
          $('#result').addClass('text-success').text('Strong');
          $('#password-strength').css('width', '100%');

          return 'Strong'
      }

  }

});