$(document).ready(function () {
  $('#multi-filter-select').DataTable({
    pageLength: 10,
    ordering: false,
    fnDrawCallback: function () {
      $('.renew').bootstrapToggle({
        on: 'Renewed',
        off: 'Not Renewed'
      });

      $('.renew').on('change.bootstrapSwitch', function (e) {
        $.ajax({
          method: 'POST',
          url: '/admin/renew/change/status',
          data: {
            'my_checkbox_value': e.target.checked,
            'id': this.id
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
      });
    }
  });

  $('#multi-filter-selectt').DataTable({
    pageLength: 10,
    ordering: false,
    fnDrawCallback: function () {
      $('.reneww').bootstrapToggle({
        on: 'Renewed',
        off: 'Not Renewed'
      });

      $('.reneww').on('change.bootstrapSwitch', function (e) {
        $.ajax({
          method: 'POST',
          url: '/admin/renew/change/status',
          data: {
            'my_checkbox_value': e.target.checked,
            'id': this.id
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
      });
    }
  });
});