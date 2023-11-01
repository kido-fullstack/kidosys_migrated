$(document).ready(function(){
  //  $("#multiple-states").select2();
  $("#customCheck1").click(function(){
    // alert('jii');
    if($("#customCheck1").is(':checked') ){
        $("#multiple-states > option").prop("selected","selected");
        $("#multiple-states").trigger("change");
    }else{
        $("#multiple-states > option").removeAttr("selected");
         $("#multiple-states").trigger("change");
     }
  });
  $(document).on('click',".select2-selection__choice__remove", function () {
    $("#customCheck1").attr('checked', false)
  })
});