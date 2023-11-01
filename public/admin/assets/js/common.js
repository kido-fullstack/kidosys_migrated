// vewAttachment
function viewAttachment(msg_id) {
  sall("Please wait...", 12000);
  $.ajax({
    url:'/admin/message/view/attachments',
    type:'POST',
    data:{
        msgId: msg_id
    },
    dataType:'json',
    success:function (response) {
      swal.close();
      // console.log(response);
      let attachments = response.data.attachment;
      $.fancybox.open(`
        <div class="card" style="width: 50% !important;">
          <div class="card-header">
            <div class="card-head-row">
              <div class="card-title">View Attachment(s)</div>
            </div>
          </div>
          <div class="card-body">
            ${attachments.map((attachment, i) => `
              <div class="d-flex">
                <div class="flex-1 ml-3 pt-1">
                  <h6 class="fw-bold mb-1">
                    ${attachment.toLowerCase()}</span>
                  </h6>
                  <span class="text-muted">Attachment ${i+1}</span>
                </div>
                <div class="float-right pt-1">
                  <a href="${attachment}" target="_blank" style="margin-left:20px;">
                      <span class="badge badge-primary badge-pill" style="font-size: 11px !important;">Open</span>
                    </a>
                </div>
              </div>
              <div class="separator-dashed"></div>
            `).join("")}
          </div>
        </div>
      `);
    }
});
}

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