$(document).ready(function () {
  $(document).on('change', '#state-id', function () {
    // alert('hey');
    var stateId = $(this).val();
    $("#city-id").empty().trigger("change");
    $("#city-id").attr("required", "")

    $.ajax({
      url: `/admin/client/select/state/${stateId}`,
      type: 'get',
      dataType: 'json',
      success: function (response) {
        var len = response.data.length;
        for (var i = 0; i < len; i++) {
          var id = response.data[i]['id'];
          var name = response.data[i]['city_name'];

          $("#city-id").append("<option value='" + id + "'>" + name + "</option>");
        }
        $("#city-id").select2("refresh");
      }
    });

  })
})