$(document).ready(function() {
  $("#clr_center").css('visibility', 'hidden');
  $("#clr_country").css('visibility', 'hidden');
  $("#clr_zone").css('visibility', 'hidden');
  $("#clr_role").css('visibility', 'hidden');
  $("#clr_status").css('visibility', 'hidden');
  var table = $('#multi-filter-select').DataTable({
    pageLength: 10,
    ordering: true,
    // dom: 'Bfrtip',
    aaSorting: [],
    columnDefs: [{
      orderable: false,
      targets: [0, 10]
    }],
    fnDrawCallback: function () {
      $('.userr').bootstrapToggle({
        on: 'Approved',
        off: 'Not Approved'
      });
    }
  });
  if(currentUser.main == "super_admin"){
    console.log("super_admin")
    let countriesList = $("#country option").length;
    let zonesList = $("#zone option").length;
    let centersList = $("#center option").length;
    $(document).on('change', '#country', function () {
      var id = $(this).val();
      var valueLength = $(this).val() ? $(this).val().length : 0;
      if (countriesList == valueLength) {
        $('#sel_country_check').prop('checked',true);
      } else {
        $('#sel_country_check').prop('checked',false);
      }
      $('#sel_zone_check').prop('checked',false);
      $('#sel_center_check').prop('checked',false);
      $("#clr_zone").css('visibility', 'hidden');
      $("#clr_center").css('visibility', 'hidden');
      if(id){
        console.log("id")
        $("#zone").html("");
        $("#center").html("");
        table
          .columns(7)
          .search("")
          .draw();
        table
          .columns(3)
          .search("")
          .draw();
        //- $('#zone').val('');
        //- $('#center').val('');
        $.ajax({
          method: 'POST',
          url: `/admin/lead/zonefilter`,
          data: {
            type: id
          },
          dataType: 'json',
          success: function (response) {
            //- console.log(response,"response")
            $("#zone").html("");
            $("#center").html("");
            // $("#zone").append(`<option value=''>Select zone</option>`);

            var len = response.data.length;
            for (var i = 0; i < len; i++) {
              var id = response.data[i]['_id'];
              var zone_name = response.data[i]['name'];
              $("#zone").append(`<option value='${id}'>${zone_name}</option>`);

            }
            $("#zone").selectpicker("refresh")
          }
        });
      }else{
        console.log("no id")
        $("#zone").html("");
        $("#center").html("");
        $("#clr_zone").css('visibility', 'hidden');
        $("#clr_center").css('visibility', 'hidden');
        $("#clr_country").css('visibility', 'hidden');
        for (var i = 0; i < data.zones.length; i++) {
          //- console.log(data.zones[i])
          var id = data.zones[i]['_id'];
          var zone_name = data.zones[i]['name'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          // $("#zone").append(`<option value=''>Select zone</option>`);
          $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
        }
        $("#zone").selectpicker("refresh");
        for (var i = 0; i < data.centers.length; i++) {
          //- console.log(data.centers[i])
          var id = data.centers[i]['_id'];
          var center_name = data.centers[i]['school_display_name'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          // $("#center").append(`<option value=''>Select center</option>`);
          $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
        }
        $("#center").selectpicker("refresh");
      }
    })
    $('#clr_country').click(function(e) {
      $("#clr_country").css('visibility', 'hidden');
      $('#sel_zone_check').prop('checked',false);
      $('#sel_center_check').prop('checked',false);
    // $('#sel_center_check').prop('checked',false);
      $("#country").selectpicker("refresh");
      table
        .columns(6)
        .search("")
        .draw();
      table
        .columns(7)
        .search("")
        .draw();
      table
        .columns(3)
        .search("")
        .draw();
      $("#zone").html("");
      $("#center").html("");
      $('#sel_country_check').prop('checked',false);
      $("#clr_zone").css('visibility', 'hidden');
      $("#clr_center").css('visibility', 'hidden');
      for (var i = 0; i < data.zones.length; i++) {
          //- console.log(data.zones[i])
        var id = data.zones[i]['_id'];
        var zone_name = data.zones[i]['name'];
        //- console.log(id,"id")
        //- console.log(zone_name,"zone_name")
        // $("#zone").append(`<option value=''>Select zone</option>`);
        $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
      }
      $("#zone").selectpicker("refresh");
      for (var i = 0; i < data.centers.length; i++) {
        //- console.log(data.centers[i])
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        //- console.log(id,"id")
        //- console.log(zone_name,"zone_name")
        // $("#center").append(`<option value=''>Select center</option>`);
        $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh");
    });
    $(document).on('change', '#zone', function () {
      var id = $(this).val();
      var valueLength = $(this).val() ? $(this).val().length : 0;
      if (zonesList == valueLength) {
        $('#sel_zone_check').prop('checked',true);
      } else {
        $('#sel_zone_check').prop('checked',false);
      }
      $('#sel_center_check').prop('checked',false);
      console.log(id,"zone");
      console.log(id,"zone");
      $("#center").html("");
      table
          .columns(3)
          .search("")
          .draw();
      $("#clr_center").css('visibility', 'hidden');
      if(id){
        console.log("id")
        $.ajax({
          method: 'POST',
          url: `/admin/lead/centerfilter`,
          data: {
            type: id
          },
          dataType: 'json',
          success: function (response) {
            //- console.log(response,"response")

            $("#center").html("");
            // $("#center").append(`<option value=''>Select center</option>`);

            var len = response.data.length;
            for (var i = 0; i < len; i++) {
              var id = response.data[i]['_id'];
              var school_name = response.data[i]['school_display_name'];
              $("#center").append(`<option value='${school_name}'>${school_name}</option>`);
            }
            $("#center").selectpicker("refresh");
            //- // $(".testi_class").select2("refresh");
          }
        });
      }else{
        console.log("no id")
        $("#center").html("");
        $("#clr_zone").css('visibility', 'hidden');
        for (var i = 0; i < data.centers.length; i++) {
          //- console.log(data.centers[i])
          var id = data.centers[i]['_id'];
          var center_name = data.centers[i]['school_display_name'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
        }
        $("#center").selectpicker("refresh");
      }
      //- $.ajax({
      //-   method: 'POST',
      //-   url: `/admin/lead/centerfilter`,
      //-   data: {
      //-     type: id
      //-   },
      //-   dataType: 'json',
      //-   success: function (response) {
      //-     //- console.log(response,"response")

      //-     $("#center").html("");
      //-     //- //- $("#program").append(`<option value=''>Select Program</option>`);

      //-     var len = response.data.length;
      //-     for (var i = 0; i < len; i++) {
      //-       var id = response.data[i]['_id'];
      //-       var school_name = response.data[i]['school_display_name'];
      //-       $("#center").append(`<option value='${id}'>${school_name}</option>`);

      //-     }
      //-     //- // $(".testi_class").select2("refresh");
      //-   }
      //- });
    });
    $('#clr_zone').click(function(e) {
      $("#center").html("");
      table
        .columns(7)
        .search("")
        .draw();
      table
        .columns(3)
        .search("")
        .draw();
      $("#clr_center").css('visibility', 'hidden');
      $('#sel_zone_check').prop('checked',false);
      $('#sel_center_check').prop('checked',false);
      // $("#center").append(`<option value=''>Select center</option>`);
      for (var i = 0; i < data.centers.length; i++) {
        //- console.log(data.centers[i])
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh");
    });
  }else{
    console.log("non_admin")
    let countriesList = $("#country option").length;
    let zonesList = $("#zone option").length;
    let centersList = $("#center option").length;
    $(document).on('change', '#country', function () {
      var id = $(this).val();
      console.log(id,"idd")
      var valueLength = $(this).val() ? $(this).val().length : 0;
          if (countriesList == valueLength) {
            $('#sel_country_check').prop('checked',true);
          } else {
            $('#sel_country_check').prop('checked',false);
          }
          $('#sel_zone_check').prop('checked',false);
          $('#sel_center_check').prop('checked',false);
        $("#zone").html("");
        $("#center").html("");
        table
          .columns(7)
          .search("")
          .draw();
        table
          .columns(3)
          .search("")
          .draw();
      // $('#sel_zone_check').prop('checked',false);
      // $('#sel_center_check').prop('checked',false);
      console.log(id,"idddddd")
      $("#clr_zone").css('visibility', 'hidden');
      $("#clr_center").css('visibility', 'hidden');
      if(id){
        console.log("id")
        $("#zone").html("");
        $("#center").html("");
        $("#clr_zone").css('visibility', 'hidden');
        $("#clr_center").css('visibility', 'hidden');
        //- $("#clr_country").css('visibility', 'hidden');
        for (var i = 0; i < data.zones.length; i++) {
          //- console.log(data.zones[i])
          var zone_id = data.zones[i]['_id'];
          var zone_name = data.zones[i]['name'];
          var country_id = data.zones[i]['country_id'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          if(id.includes(country_id)){
            console.log(zone_name,"zone_name")
            $("#zone").append(`<option value='${zone_id}'>${zone_name}</option>`);
          }
        }
        $("#zone").selectpicker("refresh");
        // for (var i = 0; i < data.centers.length; i++) {
        //   //- console.log(data.centers[i])
        //   var id = data.centers[i]['_id'];
        //   var center_name = data.centers[i]['school_display_name'];
        //   //- console.log(id,"id")
        //   //- console.log(zone_name,"zone_name")
        //   $("#center").append(`<option value='${id}'>${center_name}</option>`);
        // }
      }else{
        console.log("no id")
        $("#zone").html("");
        $("#center").html("");
        $("#clr_zone").css('visibility', 'hidden');
        $("#clr_center").css('visibility', 'hidden');
        $("#clr_country").css('visibility', 'hidden');
        for (var i = 0; i < data.zones.length; i++) {
          //- console.log(data.zones[i])
          var id = data.zones[i]['_id'];
          var zone_name = data.zones[i]['name'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
        }
        $("#zone").selectpicker("refresh");
        for (var i = 0; i < data.centers.length; i++) {
          //- console.log(data.centers[i])
          var id = data.centers[i]['_id'];
          var center_name = data.centers[i]['school_display_name'];
          //- console.log(id,"id")
          //- console.log(zone_name,"zone_name")
          $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
        }
        $("#center").selectpicker("refresh");
      }


    });
    $('#clr_country').click(function(e) {
      $("#clr_country").css('visibility', 'hidden');
    // $('#sel_center_check').prop('checked',false);
      $("#country").selectpicker("refresh");
      table
        .columns(6)
        .search("")
        .draw();
      table
        .columns(7)
        .search("")
        .draw();
      table
        .columns(3)
        .search("")
        .draw();
      $("#zone").html("");
      $("#center").html("");
      $('#sel_country_check').prop('checked',false);
      $('#sel_zone_check').prop('checked',false);
      $('#sel_center_check').prop('checked',false);
      $("#clr_zone").css('visibility', 'hidden');
      $("#clr_center").css('visibility', 'hidden');
      for (var i = 0; i < data.zones.length; i++) {
          //- console.log(data.zones[i])
        var id = data.zones[i]['_id'];
        var zone_name = data.zones[i]['name'];
        //- console.log(id,"id")
        //- console.log(zone_name,"zone_name")
        // $("#zone").append(`<option value=''>Select zone</option>`);
        $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
      }
      $("#zone").selectpicker("refresh");
      for (var i = 0; i < data.centers.length; i++) {
        //- console.log(data.centers[i])
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        //- console.log(id,"id")
        //- console.log(zone_name,"zone_name")
        // $("#center").append(`<option value=''>Select center</option>`);
        $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh");
    });
    $(document).on('change', '#zone', function () {
      var id = $(this).val();
      var valueLength = $(this).val() ? $(this).val().length : 0;
      if (zonesList == valueLength) {
        $('#sel_zone_check').prop('checked',true);
      } else {
        $('#sel_zone_check').prop('checked',false);
      }
      $('#sel_center_check').prop('checked',false);
      console.log(id,"zone");
      //- $("#center").html("");
      table
          .columns(3)
          .search("")
          .draw();
      $("#clr_center").css('visibility', 'hidden');
      $("#center").html("");
      // for (var i = 0; i < data.centers.length; i++) {
      //     //- console.log(data.centers[i])
      //     var center_id = data.centers[i]['_id'];
      //     var center_name = data.centers[i]['school_display_name'];
      //     var zone_id = data.centers[i]['zone_id'];
      //     //- console.log(id,"id")
      //     //- console.log(zone_name,"zone_name")
      //     if(id.includes(zone_id)){
      //       console.log(center_name,"center_name")
      //     }
      //     $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
      //   }
      if(id){
        - console.log("id")
        - $("#center").html("");
         for (var i = 0; i < data.centers.length; i++) {
            //- console.log(data.centers[i])
            var center_id = data.centers[i]['_id'];
            var center_name = data.centers[i]['school_display_name'];
            var zone_id = data.centers[i]['zone_id'];
            //- console.log(id,"id")
            //- console.log(zone_name,"zone_name")
            if(id.includes(zone_id)){
              console.log(center_name,"center_name")
              $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
            }
            // $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
          }
            $("#center").selectpicker("refresh");
      }else{
        //- console.log("no id")
        //- $("#center").html("");
        $("#clr_zone").css('visibility', 'hidden');
        //- for (var i = 0; i < data.centers.length; i++) {
        //-   //- console.log(data.centers[i])
        //-   var id = data.centers[i]['_id'];
        //-   var center_name = data.centers[i]['school_display_name'];
        //-   //- console.log(id,"id")
        //-   //- console.log(zone_name,"zone_name")
        //-   $("#center").append(`<option value='${id}'>${center_name}</option>`);
        //- }
      }
      //- $.ajax({
      //-   method: 'POST',
      //-   url: `/admin/lead/centerfilter`,
      //-   data: {
      //-     type: id
      //-   },
      //-   dataType: 'json',
      //-   success: function (response) {
      //-     //- console.log(response,"response")

      //-     $("#center").html("");
      //-     //- //- $("#program").append(`<option value=''>Select Program</option>`);

      //-     var len = response.data.length;
      //-     for (var i = 0; i < len; i++) {
      //-       var id = response.data[i]['_id'];
      //-       var school_name = response.data[i]['school_display_name'];
      //-       $("#center").append(`<option value='${id}'>${school_name}</option>`);

      //-     }
      //-     //- // $(".testi_class").select2("refresh");
      //-   }
      //- });
    });
    $('#clr_zone').click(function(e) {
      $("#center").html("");
      table
        .columns(7)
        .search("")
        .draw();
      table
        .columns(3)
        .search("")
        .draw();
      $("#clr_center").css('visibility', 'hidden');
      $('#sel_zone_check').prop('checked',false);
      $('#sel_center_check').prop('checked',false);
      // $("#center").append(`<option value=''>Select center</option>`);
      for (var i = 0; i < data.centers.length; i++) {
        //- console.log(data.centers[i])
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        //- console.log(id,"id")
        //- console.log(zone_name,"zone_name")

        $("#center").append(`<option value='${center_name}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh")
    });
  }
  $(document).on('change', '#center', function () {
    var id = $(this).val();
    let centersList = $("#center option").length;
    // var id = $(this).val();
    var valueLength = $(this).val() ? $(this).val().length : 0;
      if (centersList == valueLength) {
        $('#sel_center_check').prop('checked',true);
      } else {
        $('#sel_center_check').prop('checked',false);
      }
    if(!id){
      $("#clr_center").css('visibility', 'hidden');
    }
  })
  $(document).on('change', '#role', function () {
    var id = $(this).val();
    let centersList = $("#role option").length;
    // var id = $(this).val();
    var valueLength = $(this).val() ? $(this).val().length : 0;
      if (centersList == valueLength) {
        $('#sel_role_check').prop('checked',true);
      } else {
        $('#sel_role_check').prop('checked',false);
      }
    if(!id){
      $("#clr_role").css('visibility', 'hidden');
    }
  })
  let center = $('#center');
  center.on('change', function () {
    console.log(this.value,"this.valueee")
    var selectedValues = $.map(center.find('option:selected'), function (element) {
      return element.value;
    });

    if (selectedValues.length > 0) {
      table.column(3).search(selectedValues.join('|'), true, false).draw();
    } else {
      table.column(3).search('').draw();
    }
    // table
    //   .columns(3)
    //   .search(this.value)
    //   .draw();
      $("#clr_center").css('visibility', 'visible');
  });
  let country = $('#country')
  country.on('change', function () {
    var selectedValues = $.map(country.find('option:selected'), function (element) {
      return element.value;
    });
    if (selectedValues.length > 0) {
      table.column(6).search(selectedValues.join('|'), true, false).draw();
    } else {
      table.column(6).search('').draw();
    }
    // console.log(this.value,"this.valueee")
    // table
    //   .columns(6)
    //   .search(this.value)
    //   .draw();
      $("#clr_country").css('visibility', 'visible');
  });
  // $('#clr_country').click(function (e) {
  //   $("#clr_country").css('visibility', 'hidden');
  //   // $('#sel_center_check').prop('checked',false);
  //   $("#country").val(null).select2({placeholder: "Select Center",theme: "bootstrap"});
  //   table
  //     .columns(6)
  //     .search("")
  //     .draw();
  // });
  let zone = $('#zone')
  zone.on('change', function () {
    var selectedValues = $.map(zone.find('option:selected'), function (element) {
      return element.value;
    });
    if (selectedValues.length > 0) {
      table.column(7).search(selectedValues.join('|'), true, false).draw();
    } else {
      table.column(7).search('').draw();
    }
    // console.log(this.value,"this.valueee")
    // table
    //   .columns(7)
    //   .search(this.value)
    //   .draw();
      $("#clr_zone").css('visibility', 'visible');
  });
  $('#clr_zone').click(function (e) {
    $("#clr_zone").css('visibility', 'hidden');
    // $('#sel_center_check').prop('checked',false);
    $("#zone").selectpicker("refresh");
    table
      .columns(7)
      .search("")
      .draw();
  });
  $('#clr_center').click(function (e) {
    $("#clr_center").css('visibility', 'hidden');
    $('#sel_center_check').prop('checked',false);
    $("#center").selectpicker("refresh");
    table
      .columns(3)
      .search("")
      .draw();
  });
  $('#status').on('change', function () {
    console.log(this.value,"this.valueee")
    table
      .columns(9)
      .search(this.value)
      .draw();
      $("#clr_status").css('visibility', 'visible');
  });
  $('#clr_status').click(function (e) {
    $("#clr_status").css('visibility', 'hidden');
    // $('#sel_center_check').prop('checked',false);
    $("#status").selectpicker("refresh");
    table
      .columns(9)
      .search("")
      .draw();
  });
  var role = $('#role');
  role.on('change', function () {
    var selectedValues = $.map(role.find('option:selected'), function (element) {
      return element.value;
    });
    console.log(this.value,"this.valueee")
    console.log(selectedValues,"selectedValues.selectedValues")
    if (selectedValues.length > 0) {
      table.column(8).search(selectedValues.join('|'), true, false).draw();
    } else {
      table.column(8).search('').draw();
    }
    // table
    //   .columns(8)
    //   .search(this.value)
    //   .draw();
      $("#clr_role").css('visibility', 'visible');
  });
  $('#clr_role').click(function (e) {
    $("#clr_role").css('visibility', 'hidden');
    $('#sel_role_check').prop('checked',false);
    // $('#sel_center_check').prop('checked',false);
    $("#role").selectpicker("refresh");
    table
      .columns(8)
      .search("")
      .draw();
  });
});

function userApproveStatus (user_id, status) {
  $('#cover-spin').show(0);
  // console.log(status);
  //- var val = $(`#${user_id}`).val();
  //- console.log(val)
  //- return;
  var sta = '';
  if (status == '1') {
    sta = 'false';
  } else {
    sta = 'true';
  }
  $.ajax({
    method: 'POST',
    url: '/admin/employee/approve/status/toggle',
    data: {
      'my_checkbox_value': sta,
      'id': user_id
    },
    dataType: 'json',
    success: function (data) {
      $.notify({
        message: data.message
      }, {
        type: data.type,
        showProgressbar: false
      }, {
        offset: 20,
        spacing: 10,
        z_index: 1031,
        delay: 5000,
        timer: 1000
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

function viewPassword (user_id) {
  var SweetAlert2Demo = function () {
    //== Demos
    var initDemos = function () {
      swal("Please wait...", {
        buttons: false,
        timer: 12000,
        backdrop:true,
        closeOnClickOutside: false,
        closeOnEsc: false
      })
    };

    return {
        //== Init
        init: function () {
          initDemos();
        },
      };
    }();
  jQuery(document).ready(function () {
    SweetAlert2Demo.init();
  });
  $.ajax({
    url: `/admin/employee/view/password`,
    type: 'post',
    data: {
      user_id
    },
    dataType: 'json',
    success: function (response) {
      //- console.log('ajax response came');
      //- console.log(response);
      swal.close();
      $.fancybox.open(`
        <div class="reset_pass" style="width: 35%;">
          <h2 class="mb-3">Password is:</h2>
          <p>
            <input type='text' class="form-control" value="${response.password}" disabled></input>
          </p>
        </div>
      `);
      return;
    }
  });
}

function sendMail (user_id) {
  $.fancybox.close();
  var SweetAlert2Demo = function () {
    //== Demos
    var initDemos = function () {
      swal("Please wait...", {
        buttons: false,
        timer: 12000,
        backdrop:true,
        closeOnClickOutside: false,
        closeOnEsc: false
      })
    };

    return {
        //== Init
        init: function () {
          initDemos();
        },
      };
    }();
  jQuery(document).ready(function () {
    SweetAlert2Demo.init();
  });
  $.ajax({
    url: `/admin/employee/send/mail`,
    type: 'post',
    data: {
      user_id
    },
    dataType: 'json',
    success: function (response) {
      // console.log('ajax response came');
      // console.log(response);
      swal.close();
      var SweetAlert2Demo = function () {
        //== Demos
        var initDemos = function () {
          swal(response.message, {
            buttons: false,
            timer: 2000,
            backdrop:true,
            closeOnClickOutside: false,
            closeOnEsc: false
          })
        };
        return {
            //== Init
            init: function () {
              initDemos();
            },
          };
        }();
      jQuery(document).ready(function () {
        SweetAlert2Demo.init();
      });

      return;
    }
  });
}

function resetPassword (user_id) {
  var SweetAlert2Demo = function () {
    //== Demos
    var initDemos = function () {
      swal("Please wait...", {
        buttons: false,
        timer: 12000,
        backdrop:true,
        closeOnClickOutside: false,
        closeOnEsc: false
      })
    };

    return {
        //== Init
        init: function () {
          initDemos();
        },
      };
    }();
  jQuery(document).ready(function () {
    SweetAlert2Demo.init();
  });
  $.ajax({
    url: `/admin/employee/reset/password`,
    type: 'post',
    data: {
      user_id
    },
    dataType: 'json',
    success: function (response) {
      // console.log('ajax response came');
      // console.log(response);
      swal.close();
      $.fancybox.open(`
          <div class="reset_pass" style="width: 35%;">
            <h2 class="mb-3">Password is:</h2>
            <p>
              <input type='text' class="form-control" value="${response.data}" disabled></input>
            </p>
            <p class="mb-0">
              <button class="btn btn-primary btn-block password_btn" id="submit-btn" onclick="sendMail('${user_id}');" type="button">Send Mail</button>
            </p>
          </div>
      `);
      return;
    }
  });
}