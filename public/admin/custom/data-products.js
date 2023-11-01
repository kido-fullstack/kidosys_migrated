var table = $('#example').DataTable({
    "bProcessing" : true,
    "bServerSide" : true,
    "sAjaxSource" : '/admin/products',
    "aoColumns" : [
      { "mData" : "data.title" },
      { "mData" : "data.product_type" }
    ]  
});