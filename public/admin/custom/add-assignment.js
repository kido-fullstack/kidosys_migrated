$(document).ready(function () {
  var next = 1;
  $(".add-more").click(function (e) {
    e.preventDefault();
    next = next + 1;

    var newIn = `
    <div class="form-group form-show-validation row" id="remove${next}">
      <label class="col-lg-3 col-md-3 col-sm-4 mt-sm-2 text-right"></label>
        <div class="col-lg-7 col-md-9 col-sm-8">
            <div class="row input-group input-group-button">
              <div class="col-lg-3">
                <input class="input form-control" name="amenities_info[key]" id="field${next}" placeholder='Name' type="text">
                <br />
                <div class="input-group-append remove-me" data-at = "#remove${next}"><button class="btn shrink_btn btn-danger btn btn-block add-more" id="b1"  type="button">Remove</button></div>
              </div>
              <div class="col-lg-9">
                <textarea class="form-control" name="amenities_info[value]" rows="5" cols="5" placeholder="Value"></textarea>
              </div>
            </div>
        </div>
    </div>`;

    var newInput = $(newIn);
    $('.appendten').append(newInput);
    $("#field" + next).attr('data-source', $('.appendten').attr('data-source'));
    $("#count").val(next);

    $('.remove-me').click(function (e) {
      e.preventDefault();
      // console.log(this);
      var dataat = $(this).attr('data-at');
      $(dataat).remove();
      return;
    });
  });
});