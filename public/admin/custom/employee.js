$(document).ready(function() {
  $('#role').select2({
    placeholder: "Select Role",
    theme: "bootstrap"
  });
  $('#country').select2({
    placeholder: "Select Country",
    theme: "bootstrap",
    closeOnSelect: true
  });
  $('#zone').select2({
    placeholder: "Select Zone",
    theme: "bootstrap",
    closeOnSelect: true
  });
  $('#center').select2({
    placeholder: "Select Center",
    theme: "bootstrap",
    closeOnSelect: true
  });

  // $(document).on('change', '#country', function () {
  //   var id = $(this).val();
  //   // console.log(id)

  //   $("#zone").empty();

  //   $.ajax({
  //     method: 'POST',
  //     url: `/admin/zone/filter/dropdown`,
  //     data: {
  //       type: id
  //     },
  //     dataType: 'json',
  //     success: function (response) {
  //       // console.log(response,"response")
  //       $("#zone").empty();

  //       var len = response.data.length;
  //       if (len == 0) {
  //         $("#zone").append(`<option value='' disabled>No data found</option>`);
  //       }
  //       $("#zone").append(`<option value=''>Select Zone</option>`);
  //       for (var i = 0; i < len; i++) {
  //         var id = response.data[i]['_id'];
  //         var name = response.data[i]['name'];

  //         $("#zone").append(`<option value='${id}'>${name}</option>`);
  //       }
  //     }
  //   });
  // });
  $(document).on('change', '#country', function () {
    var id = $(this).val();
    // console.log(id)
    $("#zone").empty();
    $("#center").empty();

    $.ajax({
      method: 'POST',
      url: `/admin/zone/filter/dropdown`,
      data: {
        type: id
      },
      dataType: 'json',
      success: function (response) {
        // console.log(response,"response")
        $("#zone").empty();
        $("#center").empty();
        // console.log(response,"response")
        var len = response.data.length;
        if (len == 0) {
          $("#zone").append(`<option value='' disabled>No data found</option>`);
        } else if(len == 1) {
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var name = response.data[i]['name'];
            // console.log(name,"namame")
            $("#zone").append(`<option value='${id}' selected>${name}</option>`);
            // return;
            $.ajax({
              method: 'POST',
              url: `/admin/center/filter/dropdown`,
              data: {
                type: id
              },
              dataType: 'json',
              success: function (response) {
                // console.log(response,"response")
                $("#center").empty();
                var len = response.data.length;
                if(len == 1){
                  for (var i = 0; i < len; i++) {
                    var id = response.data[i]['_id'];
                    var name = response.data[i]['school_display_name'];

                    $("#center").append(`<option value='${id}' selected>${name}</option>`);
                  }
                } else {
                  for (var i = 0; i < len; i++) {
                    var id = response.data[i]['_id'];
                    var name = response.data[i]['school_display_name'];

                    $("#center").append(`<option value='${id}'>${name}</option>`);
                  }
                }
              }
            });
          }
        } else {
          $("#zone").append(`<option value=''>Select Zone</option>`);
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var name = response.data[i]['name'];
            console.log(name,"namame")
            $("#zone").append(`<option value='${id}'>${name}</option>`);
          }
        }
      }
    });
  });

  $(document).on('change', '#zone', function () {
    var id = $(this).val();
    // console.log(id)
    $("#center").empty();

    $.ajax({
      method: 'POST',
      url: `/admin/center/filter/dropdown`,
      data: {
        type: id
      },
      dataType: 'json',
      success: function (response) {
        // console.log(response,"response")
        $("#center").empty();
        var len = response.data.length;
        if(len == 1){
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var name = response.data[i]['school_display_name'];

            $("#center").append(`<option value='${id}' selected>${name}</option>`);
          }
        } else {
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var name = response.data[i]['school_display_name'];

            $("#center").append(`<option value='${id}'>${name}</option>`);
          }
        }
      }
    });
  });
})