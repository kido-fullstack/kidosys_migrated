var startDateVal;
$(document).ready(function () {
  //- selectpicker assignment
  // console.log(data);
  $("#country").selectpicker({
    noneSelectedText : 'All'
  });
  $("#zone").selectpicker({
    noneSelectedText : 'All'
  });
  $("#center").selectpicker({
    noneSelectedText : 'All'
  });
  $("#source_category").selectpicker();

  $('#clear_filter').click(function() {
    window.location.reload();
    return;
  });

  $('#clear_filter_months').click(function() {
    window.location.reload();
    return;
  });
});