$(document).ready(function(){
   $('.tog').on('change.bootstrapSwitch', function(e) {
    $.ajax({
        method: 'POST',
        url: '/admin/item/toggle',
        data: {
            'my_checkbox_value': e.target.checked,
            'id': this.id
        },
        dataType: 'json',
        success: function(data){
            $.notify({
              message: data.message 
            },{
              type: data.type,
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
    });
  });
});