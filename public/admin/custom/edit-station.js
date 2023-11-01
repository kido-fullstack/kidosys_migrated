$('document').ready(function () {
  var idArr = [];
  if (stn) {
    stn.amenities_id.map(id => {
      idArr.push(id._id);
    })
  }
  
  $(".mult").val(idArr);
  $(".mult").trigger('change');
})