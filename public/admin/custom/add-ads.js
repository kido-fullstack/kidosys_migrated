$(document).ready(function () {

  // popup and footer radio button
  $('input:radio').on('change', function (e) {
    var type = $("input[type='radio']:checked").attr('id');
    if (type == "footer") {
      $('.video').hide();
    } else if (type == "popup") {
      $('.video').show();
    }
  });

  $('#fileUpload').on('change', function() { 
    const size =  (this.files[0].size / 1024 / 1024).toFixed(2); 

    if (size > 10) { 
        alert("Maximum size is 10MB & this file is " + size + "MB");
        $('#fileUpload').val('');
        return false;
    } else { 
        
    } 
});
});