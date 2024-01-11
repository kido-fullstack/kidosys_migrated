var myDoughnutChart;
var myPieChart;
var myHorizontalBarChart;
var myHorizontalBarChart2;
var myHorizontalBarChart3;
var srcCatId;
var dateVal;
var countryID;
var zoneID;
var centerID;
var srcID;
var myMultipleLineChart;
var startMonth;
var endMonth;
var myMultipleBarChart;

function sall (msg, time) {
  var SweetAlert2Demo = function () {
  //== Demos
  var initDemos = function () {
  swal(msg, {
    buttons: false,
    timer: time,
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
};

$(document).ready(function () {
  // console.log(moment().format("M"));
  var currMonth = moment().format("M");
  $("#clr_date_range").css('visibility', 'hidden');

  var startDate = moment().month("Apr").startOf('month').format("DD/MM/YYYY ");
  var endDate = moment().add(1, 'year').month("Mar").endOf('month').format("DD/MM/YYYY ");

  if (currMonth == 1 || currMonth == 2 || currMonth == 3) {
    startDate = moment().subtract(1, 'year').month("Apr").startOf('month').format("DD/MM/YYYY ");
    endDate = moment().month("Mar").endOf('month').format("DD/MM/YYYY ");
  }

  $('#date').daterangepicker({
    autoUpdateInput: false,
    startDate: startDate,
    endDate: endDate,
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(30, 'days'), moment()],
      'This Week': [moment().startOf('isoWeek'), moment().endOf('isoWeek').add(1, 'days')],'This Month': [moment().startOf('month'), moment().endOf('month')],
      '3 Years': [moment().subtract(3, 'years'), moment()]
    },
    locale: {
      cancelLabel: 'Clear'
    }
  }, dateCallBack);

  function dateCallBack (start, end) {
    $('#date').val(start.format('DD/MM/YYYY ') + ' - ' + end.format('DD/MM/YYYY '));
  }
  dateCallBack(moment().month("Jan").startOf('month'), moment().month("Dec").endOf('month'));

  // WHEN DATE RANGE IS SELECTED
  $('#date').on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY ') + ' - ' + picker.endDate.format('DD/MM/YYYY '));
    $("#clr_date_range").css('visibility', 'visible');

    startDate = picker.startDate.format('DD/MM/YYYY ');
    endDate = picker.endDate.format('DD/MM/YYYY ');
    startAjaxAgain();
    sall("Please wait...", 3500);
  });

  // WHEN DATE RANGE HAS BEEN DE-SELECTED
  $("#clr_date_range").click(function (e) {
    $("#clr_date_range").css('visibility', 'hidden');
    //- $('#date').val('')
    dateCallBack(moment().month("Apr").startOf('month'), moment().add(1, 'year').month("Mar").endOf('month'));

    startDate = moment().month("Apr").startOf('month').format("DD/MM/YYYY ");
    endDate = moment().add(1, 'year').month("Mar").endOf('month').format("DD/MM/YYYY ");

    if (currMonth == 1 || currMonth == 2 || currMonth == 3) {
      startDate = moment().subtract(1, 'year').month("Apr").startOf('month').format("DD/MM/YYYY ");
      endDate = moment().month("Mar").endOf('month').format("DD/MM/YYYY ");
    }

    startAjaxAgain();
    sall("Please wait...", 3500);
  });

  var countryArr = [];
  // WHEN COUNTRY DROPDOWN HAS BEEN SELECTED
  $("#country").on("change", function (event) {
    $('#country').selectpicker('toggle');
    countryID = $(this).val();
    zoneID = "";
    centerID = "";
    startAjaxAgain();
    if (countryID) {
      $.ajax({
        method: 'POST',
        url: `/admin/lead/zonefilter`,
        data: {
          type: countryID
        },
        dataType: 'json',
        success: function (response) {
          // console.log(response,"response");
          $("#zone").val("");
          $("#zone option").remove();
          $("#center").val("");
          $("#center option").remove();
          $("#center").selectpicker("refresh");

          var len = response.data.length;
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var zone_name = response.data[i]['name'];
            $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
            $("#zone").selectpicker("refresh");
          }
          if (response.centers && response.centers.length > 0) {
            for (var i = 0; i < response.centers.length; i++) {
              var id = response.centers[i]['_id'];
              var school_name = response.centers[i]['school_display_name'];
              $("#center").append(`<option value='${id}'>${school_name}</option>`);
            }
          } else if (response.centers && response.centers.length == 1) {
            for (var i = 0; i < response.centers.length; i++) {
              var id = response.centers[i]['_id'];
              var school_name = response.centers[i]['school_display_name'];
              $("#center").append(`<option value='${id}'>${school_name}</option>`);
            }
          }
          $("#center").selectpicker("refresh");
        }
      })
    } else {
      // console.log('Country ID NOT given');
      $("#zone").val("");
      $("#zone option").remove();
      $("#zone").selectpicker("refresh");
      $("#center").val("");
      $("#center option").remove();
      $("#center").selectpicker("refresh");
      for (var i = 0; i < data.zones.length; i++) {
        var id = data.zones[i]['_id'];
        var zone_name = data.zones[i]['name'];
        $("#zone").append(`<option value='${id}'>${zone_name}</option>`);
      }
      $("#zone").selectpicker("refresh");
      for (var i = 0; i < data.centers.length; i++) {
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        $("#center").append(`<option value='${id}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh");
    }
    sall("Please wait...", 4000);
    var countryText = $(this).find("option:selected").map(function() {
      return $(this).text();
    }).get().join(',');
    // console.log(countryText);
    if (countryText) {
      countryArr = countryText.split(',');
    } else {
      countryArr = [];
    }
    if (countryArr && countryArr.length) {
      $(".country_pills").html("");
      $(".zone_pills").html("");
      $(".zone_box").css("display", "none");
      $(".center_pills").html("");
      $(".center_box").css("display", "none");
      $(".country_box").removeAttr("style");
      $(".country_pills").append(`
        <br></br>
        ${countryArr.map(countryDiv => `
          <label class="selectgroup-item">
            <input type="checkbox" name="value" value="${countryDiv}" class="selectgroup-input" checked='' disabled="disabled">
            <span class="selectgroup-button">${countryDiv}</span>
          </label>
        `).join("")}
      `);
    } else {
      $(".country_box").css("display", "none");
      $(".country_pills").html("");
      $(".zone_pills").html("");
      $(".zone_box").css("display", "none");
      $(".center_pills").html("");
      $(".center_box").css("display", "none");
    }
  });

  var zoneArr = [];
  // WHEN ZONE DROPDOWN HAS BEEN SELECTED
  $("#zone").on("change", function () {
    $('#zone').selectpicker('toggle');
    zoneID = $(this).val();
    centerID = "";
    startAjaxAgain();
    if (zoneID) {
      $.ajax({
        method: 'POST',
        url: `/admin/lead/centerfilter`,
        data: {
          type: zoneID
        },
        dataType: 'json',
        success: function (response) {
          // console.log(response,"response");
          $("#center").val("");
          $("#center option").remove();
          $("#center").selectpicker("refresh");

          var len = response.data.length;
          for (var i = 0; i < len; i++) {
            var id = response.data[i]['_id'];
            var school_name = response.data[i]['school_display_name'];
            $("#center").append(`<option value='${id}'>${school_name}</option>`);
          }
          $("#center").selectpicker("refresh");
        }
      })
    } else {
      $("#center").val("");
      $("#center option").remove();
      $("#center").selectpicker("refresh");
      for (var i = 0; i < data.centers.length; i++) {
        var id = data.centers[i]['_id'];
        var center_name = data.centers[i]['school_display_name'];
        $("#center").append(`<option value='${id}'>${center_name}</option>`);
      }
      $("#center").selectpicker("refresh");
    }
    sall("Please wait...", 4000);
    var zoneText = $(this).find("option:selected").map(function() {
      return $(this).text();
    }).get().join(',');
    // console.log(zoneText);
    if (zoneText) {
      zoneArr = zoneText.split(',');
    } else {
      zoneArr = [];
    }
    if (zoneArr && zoneArr.length) {
      $(".zone_pills").html("");
      $(".zone_box").removeAttr("style");
      $(".center_pills").html("");
      $(".center_box").css("display", "none");
      $(".zone_pills").append(`
        <br></br>
        ${zoneArr.map(zoneDiv => `
          <label class="selectgroup-item">
            <input type="checkbox" name="value" value="${zoneDiv}" class="selectgroup-input" checked='' disabled="disabled">
            <span class="selectgroup-button">${zoneDiv}</span>
          </label>
        `).join("")}
      `);
    } else {
      $(".zone_box").css("display", "none");
      $(".zone_pills").html("");
      $(".center_pills").html("");
      $(".center_box").css("display", "none");
    }
  });

  var centerArr = [];
  // WHEN CENTER DROPDOWN HAS BEEN SELECTED
  $("#center").on("change", function () {
    $('#center').selectpicker('toggle');
    centerID = $(this).val();
    startAjaxAgain();
    sall("Please wait...", 3500);
    var centerText = $(this).find("option:selected").map(function() {
      return $(this).text();
    }).get().join(',');
    // console.log(centerText);
    if (centerText) {
      centerArr = centerText.split(',');
    } else {
      centerArr = [];
    }
    if (centerArr && centerArr.length) {
      $(".center_pills").html("");
      $(".center_box").removeAttr("style");
      $(".center_pills").append(`
        <br></br>
        ${centerArr.map(centerDiv => `
          <label class="selectgroup-item">
            <input type="checkbox" name="value" value="${centerDiv}" class="selectgroup-input" checked='' disabled="disabled">
            <span class="selectgroup-button">${centerDiv}</span>
          </label>
        `).join("")}
      `);
    } else {
      $(".center_box").css("display", "none");
      $(".center_pills").html("");
    }
  });

  var srcCatArr = [];
  // WHEN SOURCE CATEGORY DROPDOWN HAS BEEN SELECTED
  $("#source_category").on("change", function () {
    srcID = $(this).val();
    startAjaxAgain();
    sall("Please wait...", 3500);
    var srcCatText = $(this).find("option:selected").map(function() {
      return $(this).text();
    }).get().join(',');
    // console.log(srcCatText);
    if (srcCatText) {
      srcCatArr = srcCatText.split(',');
    } else {
      srcCatArr = [];
    }
    // console.log(srcCatArr);
    if (srcCatArr && srcCatArr.length && srcCatArr[0] !== "Select Source Category") {
      $(".src_cat_pills").html("");
      $(".src_cat_box").removeAttr("style");
      $(".src_cat_pills").append(`
        <br></br>
        ${srcCatArr.map(srcCatDiv => `
          <label class="selectgroup-item">
            <input type="checkbox" name="value" value="${srcCatDiv}" class="selectgroup-input" checked='' disabled="disabled">
            <span class="selectgroup-button">${srcCatDiv}</span>
          </label>
        `).join("")}
      `);
    } else {
      $(".src_cat_box").css("display", "none");
      $(".src_cat_pills").html("");
    }
  });

  var selectedDate;
  $('.monthPicker-start').datepicker({
    autoclose: true,
    format: "yyyy-mm",
    startView: "months",
    minViewMode: "months"
  }).on("changeDate", function (e) {
    // Calculate the End Date based on the selected Start Date
    selectedDate = new Date(e.date);
    var endDate = new Date(selectedDate);
    endDate.setMonth(endDate.getMonth() + 11); // Add 12 months

    // Set the End Date input value and limit
    $('.monthPicker-end').datepicker('setStartDate', e.date);
    $('.monthPicker-end').datepicker('setEndDate', endDate);
    // $('.monthPicker-end').datepicker('setDate', endDate);
    $('.monthPicker-end').datepicker('update', null);

    var getStartMonthName = $(".monthPicker-start").val();
    startMonth = getStartMonthName; // "January" or "February"
    // console.log(startMonth);
    endMonth = "";
    if (startMonth && endMonth) {
      $(".waiting-loader-multiplelinechart-1").css("display", "block");
      $(".after-loading-multiplelinechart-1").css("display", "none");
      if (myMultipleLineChart) myMultipleLineChart.destroy();
      ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1?startMonth=${dtFormater(startMonth)}&endMonth=${dtFormater(endMonth)}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

      $(".waiting-loader-multiplebarchart-1").css("display", "block");
      $(".after-loading-multiplebarchart-1").css("display", "none");
      if (myMultipleBarChart) myMultipleBarChart.destroy();
      ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1?startMonth=${dtFormater(startMonth)}&endMonth=${dtFormater(endMonth)}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    }
  })

  $('.monthPicker-end').datepicker({
    autoclose: true,
    format: "yyyy-mm",
    startView: "months",
    minViewMode: "months"
  }).on("changeDate", function(e) {
    if (!selectedDate) {
      sall('Please choose "From Date" first.', 1000);
      $('.monthPicker-end').datepicker('update', null);
    }
    var getEndMonthName = $(".monthPicker-end").val();
    endMonth = getEndMonthName; // "January" or "February"

    if (startMonth && endMonth) {
      $(".waiting-loader-multiplelinechart-1").css("display", "block");
      $(".after-loading-multiplelinechart-1").css("display", "none");
      if (myMultipleLineChart) myMultipleLineChart.destroy();
      ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1?startMonth=${dtFormater(startMonth)}&endMonth=${dtFormater(endMonth)}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

      $(".waiting-loader-multiplebarchart-1").css("display", "block");
      $(".after-loading-multiplebarchart-1").css("display", "none");
      if (myMultipleBarChart) myMultipleBarChart.destroy();
      ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1?startMonth=${dtFormater(startMonth)}&endMonth=${dtFormater(endMonth)}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    }
  })

  $(".form-radio-input").on("change", function () {
    srcCatId = $(this).val();
    $(".waiting-loader-stage-srccat-2").css("display", "block");
    $(".after-loading-stage-srccat-2").css("display", "none");
    if (myHorizontalBarChart3) myHorizontalBarChart3.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/3?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcCatId}&`, {}, cb);
    // sall("Please wait...", 3500);
  })

  // From Date picker
  // $('.monthPicker-start').datepicker({
  //   autoclose: true,
  //   format: "mm/yyyy",
  //   startView: "months",
  //   minViewMode: "months",
  //   changeMonth: false,
  //   maxDate: 0,
  //   changeYear: false
  // }).on('changeDate', function (selected) {
  //   // console.log("Month range--", selected);
  //   startDateMonth = new Date(selected.date.valueOf());
  //   startDateMonth.setDate(startDateMonth.getDate(new Date(selected.date.valueOf())));
  //   $('.monthPicker-end').datepicker('setStartDate', startDateMonth);

  //   var getStartMonthName = $(".monthPicker-start").val();
  //   // console.log("Start month name--->", getStartMonthName);
  //   startMonth = getStartMonthName; // "January" or "February"

  //   if (startMonth && endMonth) {
  //     // For multilinebar chart
  //     $(".waiting-loader-multiplelinechart-1").css("display", "block");
  //     $(".after-loading-multiplelinechart-1").css("display", "none");
  //     if (myMultipleLineChart) myMultipleLineChart.destroy();
  //     ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

  //     // For multibar chart
  //     $(".waiting-loader-multiplebarchart-1").css("display", "block");
  //     $(".after-loading-multiplebarchart-1").css("display", "none");
  //     if (myMultipleBarChart) myMultipleBarChart.destroy();
  //     ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
  //   }
  // });

  // to Date picker
  // $('.monthPicker-end').datepicker({
  //   autoclose: true,
  //   format: "mm/yyyy",
  //   startView: "months",
  //   minViewMode: "months",
  //   changeMonth: false,
  //   maxDate: 0,
  //   changeYear: false
  // }).on('changeDate', function (selected) {
  //   // console.log("Month range--", selected);
  //   FromEndDate = new Date(selected.date.valueOf());
  //   FromEndDate.setDate(FromEndDate.getDate(new Date(selected.date.valueOf())));
  //   $('.monthPicker-start').datepicker('setEndDate', FromEndDate);

  //   var getEndMonthName = $(".monthPicker-end").val();
  //   // console.log("End month name--->", getEndMonthName);
  //   endMonth = getEndMonthName; // "January" or "February"

  //   if (startMonth && endMonth) {
  //     // For multilinebar chart
  //     $(".waiting-loader-multiplelinechart-1").css("display", "block");
  //     $(".after-loading-multiplelinechart-1").css("display", "none");
  //     if (myMultipleLineChart) myMultipleLineChart.destroy();
  //     ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

  //     // For multibar chart
  //     $(".waiting-loader-multiplebarchart-1").css("display", "block");
  //     $(".after-loading-multiplebarchart-1").css("display", "none");
  //     if (myMultipleBarChart) myMultipleBarChart.destroy();
  //     ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
  //   }
  // });

  function startAjaxAgain() {
    // sall("Please wait...");
    console.log("Ajaxing started..");
    // Start ajaxing
    // HeaderBoard
    $(".waiting-loader-headerboard_1").css("display", "block");
    $(".waiting-loader-headerboard_1").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/headerbox/lead?country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    $(".waiting-loader-headerboard_2").css("display", "block");
    $(".waiting-loader-headerboard_2").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/headerbox/followup?country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    $(".waiting-loader-headerboard_3").css("display", "block");
    $(".waiting-loader-headerboard_3").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/headerbox/followupdue?country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // CIRCLE 1
    $(".waiting-loader-circle-1").css("display", "block");
    $(".after-loading-circle-1").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/1?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/2?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/3?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // BAR GRAPH 1 - LAST 7 DAYS
    $(".waiting-loader-barchart-1").css("display", "block");
    $(".after-loading-barchart-1").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/chart/bar/1/1?country=${countryID}&zone=${zoneID}&center=${centerID}`, {}, cb);

    // BAR GRAPH 2 - LAST 7 DAYS
    $(".waiting-loader-barchart-2").css("display", "block");
    $(".after-loading-barchart-2").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/chart/bar/1/2?country=${countryID}&zone=${zoneID}&center=${centerID}`, {}, cb);

    // CIRCLE 2
    $(".waiting-loader-circle-2").css("display", "block");
    $(".after-loading-circle-2").css("display", "none");
    ajaxApiCall("GET", `/admin/reports/chart/circle/2/1?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/2/2?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // Doughnut 1
    $(".waiting-loader-doughnut-1").css("display", "block");
    $(".after-loading-doughnut-1").css("display", "none");
    if (myDoughnutChart) myDoughnutChart.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/doughnut/1/1?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // Doughnut 2
    $(".waiting-loader-piechart-1").css("display", "block");
    $(".after-loading-piechart-1").css("display", "none");
    if (myPieChart) myPieChart.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/doughnut/1/2?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // Horizontal bar graph 1
    $(".waiting-loader-piechart-2").css("display", "block");
    $(".after-loading-piechart-2").css("display", "none");
    if (myHorizontalBarChart) myHorizontalBarChart.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/1?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // Horizontal bar graph 2
    $(".waiting-loader-hori-sta-2").css("display", "block");
    $(".after-loading-hori-sta-2").css("display", "none");
    if (myHorizontalBarChart2) myHorizontalBarChart2.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/2?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // Horizontal bar graph 3
    $(".waiting-loader-stage-srccat-2").css("display", "block");
    $(".after-loading-stage-srccat-2").css("display", "none");
    if (myHorizontalBarChart3) myHorizontalBarChart3.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/3?startDate=${startDate}&endDate=${endDate}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcCatId}&`, {}, cb);

    // MultiBar Chart
    $(".waiting-loader-multiplebarchart-1").css("display", "block");
    $(".after-loading-multiplebarchart-1").css("display", "none");
    if (myMultipleBarChart) myMultipleBarChart.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);

    // MultiLinebAr Chart
    $(".waiting-loader-multiplelinechart-1").css("display", "block");
    $(".after-loading-multiplelinechart-1").css("display", "none");
    if (myMultipleLineChart) myMultipleLineChart.destroy();
    ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1?startMonth=${startMonth}&endMonth=${endMonth}&country=${countryID}&zone=${zoneID}&center=${centerID}&src_cat=${srcID}`, {}, cb);
  }
})

// Bar Chart 1
var totalIncomeChart = document.getElementById('totalIncomeChart').getContext('2d');

// Bar Chart 2
var totalIncomeChart2 = document.getElementById('totalIncomeChart1').getContext('2d');

// bar no 5
var doughnutChart = document.getElementById('doughnutChart').getContext('2d');

var horizontalBarChart = document.getElementById('horizontalBarChart').getContext('2d');

var horizontalBarChart2 = document.getElementById('horizontalBarChart2').getContext('2d');

var horizontalBarChart3 = document.getElementById('horizontalBarChart3').getContext('2d');

// Pie chart 6
var pieChart = document.getElementById('pieChart').getContext('2d');

var multipleLineChart = document.getElementById('multipleLineChart').getContext('2d')

var multipleBarChart = document.getElementById('multipleBarChart').getContext('2d');


function dtFormater(str) {
 return (moment(str, 'DD/MM/YYYY').toDate()).toISOString().substring(0, 10); 
}

$(document).ready(function () {
  // console.log($('#date').val());
  var dateVal = $('#date').val()
  var startDateFront = dateVal ? dateVal.split(" - ")[0] : "";
  var endDateFront = dateVal ? dateVal.split(" - ")[1] : "";

  // console.log(startDateFront);
  // console.log((moment(startDateFront, 'DD/MM/YYYY').toDate()).toISOString().substring(0, 10));
  // console.log((moment(endDateFront, 'DD/MM/YYYY').toDate()).toISOString().substring(0, 10));

  startDateFront = dtFormater(startDateFront);
  endDateFront = dtFormater(endDateFront);

  // console.log( (new Date(startDateFront)).toISOString()  )
  // console.log( (new Date(endDateFront)).toISOString()  )
  $(".after-loading-barchart-1").hide(0);
  $(".after-loading-barchart-2").hide(0);

  headerBoard1 ();
  headerBoard2 ();
  headerBoard3 ();
  circle1();
  circle2();
  barChart1();
  barChart2();
  doughnutChart1();
  horizontalChart();
  horizontalChart2();
  horizontalChart3();
  multipleBarChartFunc();
  multipleLineBarChartFunc();

  $("#country").selectpicker();
  $("#zone").selectpicker();
  $("#center").selectpicker();
  $("#source").selectpicker();

  setTimeout(() => {
    $(".waiting-loader-feed-1").css("display", "none");
    $(".after-loading-feed-1").css("display", "block");
  }, 3000)

  function headerBoard1 () {
    ajaxApiCall("GET", `/admin/reports/headerbox/lead?type=lead`, {}, cb);
  }

  function headerBoard2 () {
    ajaxApiCall("GET", `/admin/reports/headerbox/followup?type=lead`, {}, cb);
  }

  function headerBoard3 () {
    ajaxApiCall("GET", `/admin/reports/headerbox/followupdue?type=lead`, {}, cb);
  }

  function circle1 () {
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/1?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/2?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/1/3?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function circle2 () {
    ajaxApiCall("GET", `/admin/reports/chart/circle/2/1?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/circle/2/2?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function barChart1 () {
    ajaxApiCall("GET", `/admin/reports/chart/bar/1/1?type=lead`, {}, cb);
  }

  function barChart2 () {
    ajaxApiCall("GET", `/admin/reports/chart/bar/1/2?type=enquiry`, {}, cb);
  }

  function doughnutChart1 () {
    ajaxApiCall("GET", `/admin/reports/chart/doughnut/1/1?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
    ajaxApiCall("GET", `/admin/reports/chart/doughnut/1/2?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function horizontalChart () {
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/1?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function horizontalChart2 () {
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/2?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function horizontalChart3 () {
    ajaxApiCall("GET", `/admin/reports/chart/horizontal/3?startDate=${startDateFront}&endDate=${endDateFront}`, {}, cb);
  }

  function multipleBarChartFunc() {
    ajaxApiCall("GET", `/admin/reports/chart/multiplebarchart/1`, {}, cb);
  }

  function multipleLineBarChartFunc () {
    ajaxApiCall("GET", `/admin/reports/chart/multipleLinebarchart/1`, {}, cb);
  }
});

function ajaxApiCall (callType, url, data, cb) {
  $.ajax({
    type: callType,
    url: url,
    data: data,
    success: function(result) {
      // console.log(result);
      cb(result);
    }
  })
}

var loader = 0;
function cb (data) {
  // console.log("CALLBACK---");
  // console.log(data);
  if (data.length && data[0].chart == "headerboard_1") {
    loader++;
    $(".waiting1").css("display", "none");
    $(".done1").css("display", "block");
    $(".done1").html(data[0].data[0].todayLead);
  } else if (data.length && data[0].chart == "headerboard_2") {
    loader++;
    $(".waiting2").css("display", "none");
    $(".done2").css("display", "block");
    $(".done2").html(data[0].data[0].todayfollowup);
  } else if (data.length && data[0].chart == "headerboard_3") {
    loader++;
    $(".waiting3").css("display", "none");
    $(".done3").css("display", "block");
    $(".done3").html(data[0].data[0].todayfollowupdue);
  } else if (data.length && data[0].chart == "circle_1_1") {
    loader++;
    $(".waiting-loader-circle-1").css("display", "none");
    $(".after-loading-circle-1").css("display", "block");
    // console.log('FILTER 1----->', data);
    Circles.create({
      id: 'circles-1',
      radius: 45,
      value: 10,
      maxValue: 0,
      width: 7,
      text: data[0].count !== 0 ? Math.round(data[0].count) : "0",
      colors: ['#00356A'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
    });
  } else if (data.length && data[0].chart == "circle_2_1") {
    loader++;
    $(".waiting-loader-circle-1").css("display", "none");
    $(".after-loading-circle-1").css("display", "block");
    Circles.create({
      id: 'circles-2',
      radius: 45,
      value: 70,
      maxValue: 0,
      width: 7,
      text: data[0].count !== 0 ? Math.round(data[0].count) : "0",
      colors: ['#BD5319'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
    });
    $(".circle_1").css("display", "block");
    $(".circle_1").html(`Lead to Tour: ${data[0].percentage !== 0 ? Math.round(data[0].percentage) : "0"}%`);
  } else if (data.length && data[0].chart == "circle_3_1") {
    loader++;
    $(".waiting-loader-circle-1").css("display", "none");
    $(".after-loading-circle-1").css("display", "block");
    Circles.create({
      id: 'circles-3',
      radius: 45,
      value: 40,
      maxValue: 0,
      width: 7,
      text: data[0].count !== 0 ? Math.round(data[0].count) : "0",
      colors: ['#5F712D'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
    });
    $(".circle_11").css("display", "block");
    $(".circle_11").html(` &nbsp;| Tour to Enrollment: ${data[0].percentage !== 0 ? Math.round(data[0].percentage) : "0"}%`);
  } else if (data.length && data[0].chart == "bar_1_1") {
    loader++;
    // console.log('bar chart 1 load..');
    $(".waiting-loader-barchart-1").css("display", "none");
    $(".after-loading-barchart-1").show(0);
    // mytotalIncomeChart.update();
    $(".tot-lead-count").text(data[0].sum);
    var mytotalIncomeChart = new Chart(totalIncomeChart, {
      type: 'bar',
      data: {
        // labels: ["S", "M", "T", "W", "T", "F", "S", "S", "M", "T"],
        labels: data[0].day.reverse(),
        datasets: [{
        label: "Total leads",
        backgroundColor: '#00356A',
        borderColor: 'rgb(23, 125, 255)',
        data: data[0].count.reverse(),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            ticks: {
              display: false //--this will remove only the label
            },
            gridLines: {
              drawBorder: false,
              display: false
            }
          }],
          xAxes: [{
            gridLines: {
              drawBorder: false,
              display: false
            }
          }]
        },
      }
    });
  } else if (data.length && data[0].chart == "bar_2_1") {
    loader++;
    // console.log('bar chart 2 load..');
    $(".waiting-loader-barchart-2").css("display", "none");
    $(".after-loading-barchart-2").show(0);
    // mytotalIncomeChart.update();
    $(".tot-enq-count").text(data[0].sum);
    var mytotalIncomeChart2 = new Chart(totalIncomeChart2, {
      type: 'bar',
      data: {
        labels: data[0].day.reverse(),
        datasets: [{
        label: "Total Walk-ins",
        backgroundColor: '#00356A',
        borderColor: 'rgb(23, 125, 255)',
        data: data[0].count.reverse(),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            ticks: {
              display: false //--this will remove only the label
            },
            gridLines: {
              drawBorder: false,
              display: false
            }
          }],
          xAxes: [{
            gridLines: {
              drawBorder: false,
              display: false
            }
          }]
        },
      }
    });
  } else if (data.length && data[0].chart == "doughnut_1_1") {
    loader++;
    $(".waiting-loader-doughnut-1").css("display", "none");
    $(".after-loading-doughnut-1").css("display", "block");
    $(".pro_cat_div").show();

    if (data[0].programCatPercentage && data[0].programCatPercentage.length) {
      myDoughnutChart = new Chart(doughnutChart, {
        type: 'pie',
        data: {
          datasets: [{
            data: data[0].programCatPercentage,
            backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb']
          }],
          labels: data[0].programCat
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend : {
            position: 'bottom'
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }
          }
        }
      });
      $(".d11").css("display", "block");
      $(".d11").html(`${data[0].belowCount.join(" | ")}`);
      $(".d12").css("display", "block");
      $(".d12").html(`Total - ${data[0].total} leads`);
    } else {
      $(".pro_cat_div").hide();
    }
  } else if (data.length && data[0].chart == "circle_1_2") {
    loader++;
    $(".waiting-loader-circle-2").css("display", "none");
    $(".after-loading-circle-2").css("display", "block");
    Circles.create({
      id: 'circles-4',
      radius: 45,
      value: 10,
      maxValue: 1000000,
      width: 7,
      text: data[0].count !== 0 ? Math.round(data[0].count) : "0",
      colors: ['#00356A'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
    })
  } else if (data.length && data[0].chart == "circle_2_2") {
    loader++;
    // console.log('2nd card of 2nd circle loaded...');
    // console.log(data);
    $(".waiting-loader-circle-2").css("display", "none");
    $(".after-loading-circle-2").css("display", "block");
    Circles.create({
      id: 'circles-5',
      radius: 45,
      value: 70,
      maxValue: 1000000,
      width: 7,
      text: data[0].count !== 0 ? Math.round(data[0].count) : "0",
      colors: ['#5F712D'],
      duration: 400,
      wrpClass: 'circles-wrp',
      textClass: 'circles-text',
      styleWrapper: true,
      styleText: true
    });
    $(".circle_2").css("display", "block");
    $(".circle_2").html(`Walk-ins to Enrollments: ${data[0].percentage !== 0 ? Math.round(data[0].percentage) : "0"}%`);
  } else if (data.length && data[0].chart == "doughnut_2_1") {
    loader++;
    console.log("doughnut22", data);
    $(".waiting-loader-piechart-1").css("display", "none");
    $(".after-loading-piechart-1").css("display", "block");

    $(".pro_div").show();

    // console.log("2nd pie chart loaded....");
    // console.log("here is the data ---", data);

    if (data[0].programPercentage && data[0].programPercentage.length) {
      // myPieChart = new Chart(pieChart, {
      //   type: 'pie',
      //   data: {
      //     datasets: [{
      //       data: data[0].programPercentage,
      //       backgroundColor :['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb'],
      //       borderWidth: 0
      //     }],
      //     labels: data[0].program
      //   },
      //   options : {
      //     responsive: true,
      //     maintainAspectRatio: false,
      //     legend: {
      //       position : 'bottom',
      //       labels : {
      //         fontColor: 'rgb(154, 154, 154)',
      //         fontSize: 11,
      //         usePointStyle : true,
      //         padding: 20
      //       }
      //     },
      //     pieceLabel: {
      //       render: 'percentage',
      //       fontColor: 'white',
      //       fontSize: 14,
      //     },
      //     tooltips: false,
      //     layout: {
      //       padding: {
      //         left: 20,
      //         right: 20,
      //         top: 20,
      //         bottom: 20
      //       }
      //     }
      //   }
      // })

      myPieChart = new Chart(pieChart, {
        type: 'pie',
        data: {
          datasets: [{
            data: data[0].programPercentage,
            backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb']
          }],
          labels: data[0].program
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend : {
            position: 'bottom',
            labels : {
              fontColor: 'rgb(154, 154, 154)',
              fontSize: 11,
              usePointStyle : true,
              padding: 20
            }
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }
          }
        }
      });
      $(".d21").css("display", "block");
      $(".d21").html(`${data[0].belowCount.join(" | ")}`);
      $(".d22").css("display", "block");
      $(".d22").html(`Total - ${data[0].total} leads`);
    } else {
      $(".pro_div").hide();
    }
  } else if (data.length && data[0].chart == "horizontal_1") {
    loader++;
    $(".waiting-loader-piechart-2").css("display", "none");
    $(".after-loading-piechart-2").css("display", "block");
    // console.log("HORIZONTAL CHART LOADED...");
    // console.log(data);

    $(".ld_cnt_status").show();

    // horizontal bar chart
    if (data && data[0].sourceNames && data[0].sourceNames.length) {
      myHorizontalBarChart = new Chart(horizontalBarChart, {
        type: 'horizontalBar',
        data: {
          labels: data[0].sourceNames,
          datasets: [{
            label: '',
            data: data[0].sourceCount,
            backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb', '#4A235A', '#5D6D7E', '#F5CBA7', '#641E16', '#000080', '#00FFFF', '#FF0000']
          }],
        },
        options: {
          responsive: true,
          legend: {
            display: false,
            position: 'bottom',
            fullWidth: true,
            labels: {
              boxWidth: 10,
              padding: 50
            }
          }
        }
      });
    } else {
      $(".ld_cnt_status").hide();
    }
  } else if (data.length && data[0].chart == "horizontal_2") {
    loader++;
    $(".waiting-loader-hori-sta-2").css("display", "none");
    $(".after-loading-hori-sta-2").css("display", "block");
    // console.log("HORIZONTAL CHART LOADED...");
    // console.log(data);

    $(".ld_cnt_status_og").show();

    // horizontal bar chart
    if (data && data[0].statusNames && data[0].statusNames.length) {
      myHorizontalBarChart2 = new Chart(horizontalBarChart2, {
        type: 'horizontalBar',
        data: {
          labels: data[0].statusNames,
          datasets: [{
            label: '',
            data: data[0].statusCount,
            backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb', '#4A235A', '#5D6D7E', '#F5CBA7', '#641E16', '#000080', '#00FFFF', '#FF0000']
          }],
        },
        options: {
          responsive: true,
          legend: {
            display: false,
            position: 'bottom',
            fullWidth: true,
            labels: {
              boxWidth: 10,
              padding: 50
            }
          }
        }
      });
    } else {
      $(".ld_cnt_status_og").hide();
    }
  } else if (data.length && data[0].chart == "horizontal_3") {
    loader++;
    $(".waiting-loader-stage-srccat-2").css("display", "none");
    $(".after-loading-stage-srccat-2").css("display", "block");
    // console.log("HORIZONTAL CHART LOADED...");
    // console.log(data);

    // $(".ld_stg_sc_og").show();

    // // horizontal bar chart
    // if (data && data[0].stages && data[0].stages.length) {
    //   myHorizontalBarChart3 = new Chart(horizontalBarChart3, {
    //     type: 'horizontalBar',
    //     data: {
    //       labels: data[0].stages,
    //       datasets: [{
    //         label: '',
    //         data: data[0].stageCount,
    //         backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb', '#4A235A', '#5D6D7E', '#F5CBA7', '#641E16', '#000080', '#00FFFF', '#FF0000']
    //       }],
    //     },
    //     options: {
    //       responsive: true,
    //       legend: {
    //         display: false,
    //         position: 'bottom',
    //         fullWidth: true,
    //         labels: {
    //           boxWidth: 10,
    //           padding: 50
    //         }
    //       }
    //     }
    //   });
    // } else {
    //   $(".ld_stg_sc_og").hide();
    // }

    myHorizontalBarChart3 = new Chart(horizontalBarChart3, {
      type: 'horizontalBar',
      data: {
        labels: data[0].stages,
        datasets: [{
          label: '',
          data: data[0].stageCount,
          backgroundColor: ['#00356A','#BD5319','#5F712D', '#EB0000', '#77eb34', '#34ebc6', '#34c6eb', '#3459eb', '#eb34e5', '#004040', '#6d4646', '#d1aab2', '#051541', '#808000', '#fed07b', '#d0e0eb', '#4A235A', '#5D6D7E', '#F5CBA7', '#641E16', '#000080', '#00FFFF', '#FF0000']
        }],
      },
      options: {
        responsive: true,
        legend: {
          display: false,
          position: 'bottom',
          fullWidth: true,
          labels: {
            boxWidth: 10,
            padding: 50
          }
        }
      }
    });
  } else if (data.length && data[0].chart == "multibar_1") {
    $(".waiting-loader-multiplebarchart-1").css("display", "none");
    $(".after-loading-multiplebarchart-1").css("display", "block");

    // console.log("multiple bar chart loaded...");
    // console.log(data)

    myMultipleBarChart = new Chart(multipleBarChart, {
      type: 'bar',
      data: {
        labels: data[0].label,
        // datasets : [{
        //   label: "First time visitors",
        //   backgroundColor: '#59d05d',
        //   borderColor: '#59d05d',
        //   data: [95, 100, 112, 101, 144, 159, 178, 156, 188, 190, 210, 245],
        // },{
        //   label: "Visitors",
        //   backgroundColor: '#fdaf4b',
        //   borderColor: '#fdaf4b',
        //   data: [145, 256, 244, 233, 210, 279, 287, 253, 287, 299, 312,356],
        // }, {
        //   label: "Pageview",
        //   backgroundColor: '#177dff',
        //   borderColor: '#177dff',
        //   data: [185, 279, 273, 287, 234, 312, 322, 286, 301, 320, 346, 399],
        // }],
        datasets : data[0].data,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position : 'bottom'
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: true
          }]
        }
      }
    });
  } else if (data.length && data[0].chart == "multilinebar_1") {
    $(".waiting-loader-multiplelinechart-1").css("display", "none");
    $(".after-loading-multiplelinechart-1").css("display", "block");

    $(".waiting-loader-monthrange").css("display", "none");
    $(".after-loader-monthrange").removeAttr("style");

    // console.log('MULTI LINE BAR CHART LOADED....');
    // console.log(data);

    myMultipleLineChart = new Chart(multipleLineChart, {
      type: 'line',
      data: {
        labels: data[0].label,
        datasets: data[0].data,
        // datasets: [{
        //   label: "Python",
        //   borderColor: "#1d7af3",
        //   pointBorderColor: "#FFF",
        //   pointBackgroundColor: "#1d7af3",
        //   pointBorderWidth: 2,
        //   pointHoverRadius: 4,
        //   pointHoverBorderWidth: 1,
        //   pointRadius: 4,
        //   backgroundColor: 'transparent',
        //   fill: true,
        //   borderWidth: 2,
        //   data: [30, 45, 45, 68, 69, 90, 100, 158, 177, 200, 245, 256]
        // },{
        //   label: "PHP",
        //   borderColor: "#59d05d",
        //   pointBorderColor: "#FFF",
        //   pointBackgroundColor: "#59d05d",
        //   pointBorderWidth: 2,
        //   pointHoverRadius: 4,
        //   pointHoverBorderWidth: 1,
        //   pointRadius: 4,
        //   backgroundColor: 'transparent',
        //   fill: true,
        //   borderWidth: 2,
        //   data: [10, 20, 55, 75, 80, 48, 59, 55, 23, 107, 60, 87]
        // }, {
        //   label: "Ruby",
        //   borderColor: "#f3545d",
        //   pointBorderColor: "#FFF",
        //   pointBackgroundColor: "#f3545d",
        //   pointBorderWidth: 2,
        //   pointHoverRadius: 4,
        //   pointHoverBorderWidth: 1,
        //   pointRadius: 4,
        //   backgroundColor: 'transparent',
        //   fill: true,
        //   borderWidth: 2,
        //   data: [10, 30, 58, 79, 90, 105, 117, 160, 185, 210, 185, 194]
        // }]
      },
      options : {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'top',
        },
        tooltips: {
          bodySpacing: 4,
          mode:"nearest",
          intersect: 0,
          position:"nearest",
          xPadding:10,
          yPadding:10,
          caretPadding:10
        },
        layout:{
          padding:{left:15,right:15,top:15,bottom:15}
        }
      }
    });
  }
}