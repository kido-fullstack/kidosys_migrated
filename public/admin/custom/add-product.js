$(document).ready(function () {
  // console.log(prod);

  // simple and variation radio button
  $('.table-responsive').hide();
  $('.product-sel').hide();

  $('input:radio').on('change', function (e) {
    var type = $("input[type='radio']:checked").attr('id');
    if (type == "spare") {
      $('.table-responsive').show();
      $('.product-sel').show();
      $('#multiple-states').attr("required", true);
    } else if (type == "product") {
      $('.table-responsive').hide();
      $('.product-sel').hide();
      $('#multiple-states').removeAttr("required", false);
    }
  });

  $(document).on("click", ".addmore", function () {
    var counterindex = $("#addmoreTable tbody tr:last-child").attr('tr_count');
    if (isNaN(counterindex)) {
      counterindex = 0
    } else {
      counterindex++;
    }

    var htmlContent = `
      <tr tr_count = "${counterindex}">
        <td>
          <select id="state${counterindex}" class="form-control state" name="warehouse[]" style="height: 20px !important" required="">
            <option value="">--- Select Warehouse ---</option>
            ${warehouseObj.map(warehouse => `
              <option value=${warehouse._id}>${warehouse.name}</option>
            `)}
          </select>
        </td>
        <td>
          <input type='text' name='qty[${counterindex}]' value=0 style="height: 30px !important; border-color: rgba(0, 0, 0, 0.48)" class='form-control' required="">
        </td>
        <td>
          <button class='btn btn-danger btn-sm remove' type="button">
            Remove
          </button>
        </td>
      </tr>`;

    $("#addmoreTable tbody").append(htmlContent);
  });

  $(document).on("click", ".remove", function () {
    if ($("#addmoreTable tbody tr").length > 1) {
      $(this).closest("tr").remove();
    } else {
      alert("Atlease one row should be there")
    }
  });

  $(document).on("change", '.state', function () {
    var flag = false;
    $('select.state').each(function () {
      var state = this.value;
      if (state != "") {
        $('.state')
          .not(this)
          .filter(function () {
            if (!flag) {
              if (this.value == state) {
                flag = true;
                $(this).val("");
                alert('This warehouse is already selected!');
                $(this).closest("tr").remove();
                return false;
              } else {
                // alert("not same");
                return false;
              }
            }
          });
      }
    });
  });
});