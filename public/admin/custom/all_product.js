$(document).ready(function () {

  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="tooltipdate"]').tooltip();


  var table = $('#all_products').DataTable({
    ordering: false
  });

  $('#product_type').on('change', function () {
    table
      .columns(3)
      .search(this.value)
      .draw();
  });

  $('#status').on('change', function () {
    table
      .columns(5)
      .search(this.value)
      .draw();
  });

  $('#clear_filter').click(function () {
    table
      .search('')
      .columns().search('')
      .draw();

    $('#product_type').val('').change();
    $('#status').val('').change();
  });

  $('.download_all_products').click(function () {

      var SweetAlert2Demo = function () {
        var initDemos = function () {
          swal({
            title: 'Select option for pdf',
            text: 'Do you want for Client or Internal?',
            type: 'warning',
            buttons:{
              cancel: {
                visible: true,
                text : 'Client',
                className: 'btn mr-2 btn-black'
              },
              confirm: {
                text : 'Internal',
                className : 'btn btn-primary'
              }
            }
          }).then((response) => {
            if (response) {
              // internal
              var SweetAlert2Demo = function () {

                //== Demos
                var initDemos = function () {
                  swal("Please wait while pdf is generating...", {
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
                type: 'POST',
                url: '/admin/product/generate/pdf/product/all',
                data: {
                  pdfType: 'internal',
                },
                success: function(result) {
                  // console.log(result);
                  // return;
                  if (result.type == 'success') {
                    swal.close();
                    $.notify({
                      message: 'PDF Generated!'
                    },{
                      type: 'success',
                      showProgressbar: false
                    },
                    {
                      offset: 20,
                      spacing: 10,
                      z_index: 1031,
                      delay: 5000,
                      timer: 1000
                    });

                    setTimeout(function () {
                      // console.log('inininin');
                      //- window.location.href = result.fileName;
                      var win = window.open(result.fileName, "_blank") || window.location.replace(result.fileName);
                      win.onload = function () {
                        $.ajax({
                          type: 'POST',
                          url: '/api/helper/remove/pdf',
                          data: {
                            file: result.file
                          },
                          success: function (final) {
                            if (final.message == 'success') {
                              // console.log('file got deleted');
                              return;
                            } else {
                              $.notify({
                                message: 'File not getting deleted!'
                              },{
                                type: 'error',
                                showProgressbar: false
                              },
                              {
                                offset: 20,
                                spacing: 10,
                                z_index: 1031,
                                delay: 5000,
                                timer: 1000
                              });
                            }
                          }
                        })
                      }
                    }, 1000)
                    return;
                  } else {
                    swal.close();
                    $.notify({
                      message: 'Something went wrong!'
                    },{
                      type: 'danger',
                      showProgressbar: false
                    },
                    {
                      offset: 20,
                      spacing: 10,
                      z_index: 1031,
                      delay: 5000,
                      timer: 1000
                    });
                    return;
                  }
                }
              })
            } else {
              // client
              var SweetAlert2Demo = function () {

                //== Demos
                var initDemos = function () {
                  swal("Please wait while pdf is generating...", {
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
                type: 'POST',
                url: '/admin/product/generate/pdf/product/all',
                data: {
                  pdfType: 'client',
                },
                success: function(result) {
                  // console.log(result);
                  // console.log('clinetttt');
                  if (result.type == 'success') {
                    swal.close();
                    $.notify({
                      message: 'PDF Generated!'
                    },{
                      type: 'success',
                      showProgressbar: false
                    },
                    {
                      offset: 20,
                      spacing: 10,
                      z_index: 1031,
                      delay: 5000,
                      timer: 1000
                    });

                    setTimeout(function () {
                      //- window.location.href = result.fileName;
                      var win = window.open(result.fileName, "_blank") || window.location.replace(result.fileName);
                      win.onload = function () {
                        $.ajax({
                          type: 'POST',
                          url: '/api/helper/remove/pdf',
                          data: {
                            file: result.file
                          },
                          success: function (final) {
                            if (final.message == 'success') {
                              // console.log('file got deleted');
                              return;
                            } else {
                              $.notify({
                                message: 'File not getting deleted!'
                              },{
                                type: 'error',
                                showProgressbar: false
                              },
                              {
                                offset: 20,
                                spacing: 10,
                                z_index: 1031,
                                delay: 5000,
                                timer: 1000
                              });
                            }
                          }
                        })
                      }
                    }, 1000)
                    return;
                  } else {
                    swal.close();
                    $.notify({
                      message: 'Something went wrong!'
                    },{
                      type: 'danger',
                      showProgressbar: false
                    },
                    {
                      offset: 20,
                      spacing: 10,
                      z_index: 1031,
                      delay: 5000,
                      timer: 1000
                    });
                    return;
                  }
                }
              })
            }
          });
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
  });

  $(document).on('click', '.view_spares', function (e) {
    var productID = $(this).data('id');
    var productName = $(this).data('productname');

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
        type: 'POST',
        url: '/admin/product/get/product/detail',
        data: {
          _id: productID
        },
        success: function (result) {
          swal.close();
          // console.log(result);
          $.fancybox.open(`
            <div class="card">
              <div class="card-header">
                <div class="card-head-row">
                  <div class="card-title">${productName}</div>
                </div>
                <div class="">
                <a href="javascript:void(0)" class="pdf-warehouse" onclick='generateSingleProductPDF(${JSON.stringify(result)}, "${productName}")'>
                  <span class="badge badge-primary badge-pill">Generate PDF for this product</span>
                </a>
                </div>
              </div>
              <div class="card-body">
                ${result.data.map(spare => `
                  <div class="d-flex">
                    <div class="flex-1 ml-3 pt-1">
                      <h6 class="text-uppercase fw-bold mb-1">
                        ${spare.name}
                        <span class="text-primary pl-3">(${spare.price} /-)</span>
                      </h6>
                      <span class="text-muted">Total Qty: ${spare.total_qty} remaining</span>
                    </div>
                  </div>
                  <div class="separator-dashed"></div>
                `).join("")}
                <a href="javascript:void(0)" class="pdf-warehouse" onclick='generateSingleProductPDF(${JSON.stringify(result)}, "${productName}")'>
                  <span class="badge badge-primary badge-pill">Generate PDF for this product</span>
                </a>
              </div>
            </div>
          `);
        }
      })
  });
});

async function generateSingleProductPDF(spares, productName) {
  $.fancybox.close();

  var SweetAlert2Demo = function () {
    var initDemos = function () {
      swal({
        title: 'Select option for pdf',
        text: 'Do you want for Client or Internal?',
        type: 'warning',
        buttons:{
          cancel: {
            visible: true,
            text : 'Client',
            className: 'btn mr-2 btn-black'
          },
          confirm: {
            text : 'Internal',
            className : 'btn btn-primary'
          }
        }
      }).then((response) => {
        if (response) {
          var SweetAlert2Demo = function () {

            //== Demos
            var initDemos = function () {
              swal("Please wait while pdf is generating...", {
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
            type: 'POST',
            url: '/admin/product/generate/pdf/product',
            data: {
              spares,
              pdfType: 'internal',
              productName
            },
            success: function(result) {
              // console.log(result);
              if (result.type == 'success') {
                swal.close();
                $.notify({
                  message: 'PDF Generated!'
                },{
                  type: 'success',
                  showProgressbar: false
                },
                {
                  offset: 20,
                  spacing: 10,
                  z_index: 1031,
                  delay: 5000,
                  timer: 1000
                });

                setTimeout(function () {
                  //- window.location.href = result.fileName;
                  var win = window.open(result.fileName, "_blank") || window.location.replace(result.fileName);
                  win.onload = function () {
                    $.ajax({
                      type: 'POST',
                      url: '/api/helper/remove/pdf',
                      data: {
                        file: result.file
                      },
                      success: function (final) {
                        if (final.message == 'success') {
                          // console.log('file got deleted');
                          return;
                        } else {
                          $.notify({
                            message: 'File not getting deleted!'
                          },{
                            type: 'error',
                            showProgressbar: false
                          },
                          {
                            offset: 20,
                            spacing: 10,
                            z_index: 1031,
                            delay: 5000,
                            timer: 1000
                          });
                        }
                      }
                    })
                  }
                }, 1000)
                return;
              } else {
                swal.close();
                $.notify({
                  message: 'Something went wrong!'
                },{
                  type: 'danger',
                  showProgressbar: false
                },
                {
                  offset: 20,
                  spacing: 10,
                  z_index: 1031,
                  delay: 5000,
                  timer: 1000
                });
                return;
              }
            }
          })
        } else {
          // client
          var SweetAlert2Demo = function () {

            //== Demos
            var initDemos = function () {
              swal("Please wait while pdf is generating...", {
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
            type: 'POST',
            url: '/admin/product/generate/pdf/product',
            data: {
              spares,
              pdfType: 'client',
              productName
            },
            success: function(result) {
              // console.log(result);
              if (result.type == 'success') {
                swal.close();
                $.notify({
                  message: 'PDF Generated!'
                },{
                  type: 'success',
                  showProgressbar: false
                },
                {
                  offset: 20,
                  spacing: 10,
                  z_index: 1031,
                  delay: 5000,
                  timer: 1000
                });

                setTimeout(function () {
                  //- window.location.href = result.fileName;
                  var win = window.open(result.fileName, "_blank") || window.location.replace(result.fileName);
                  win.onload = function () {
                    $.ajax({
                      type: 'POST',
                      url: '/api/helper/remove/pdf',
                      data: {
                        file: result.file
                      },
                      success: function (final) {
                        if (final.message == 'success') {
                          // console.log('file got deleted');
                          return;
                        } else {
                          $.notify({
                            message: 'File not getting deleted!'
                          },{
                            type: 'error',
                            showProgressbar: false
                          },
                          {
                            offset: 20,
                            spacing: 10,
                            z_index: 1031,
                            delay: 5000,
                            timer: 1000
                          });
                        }
                      }
                    })
                  }
                }, 1000)
                return;
              } else {
                swal.close();
                $.notify({
                  message: 'Something went wrong!'
                },{
                  type: 'danger',
                  showProgressbar: false
                },
                {
                  offset: 20,
                  spacing: 10,
                  z_index: 1031,
                  delay: 5000,
                  timer: 1000
                });
                return;
              }
            }
          })
        }
      });
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