
let overlayDom;
let modalDom;
let modalBody;
let modalHeader;

function updateSize(){
  let padding = 30;

  let modalHeight = overlayDom.outerHeight() - padding * 2;
  let bodyHeight  = modalHeight - modalHeader.outerHeight();

  modalBody.height(bodyHeight);
  modalDom.css("margin-top","-"+Math.round(modalHeight / 2)+"px");
}

let Modal = {
    init(){
      overlayDom  = $('<div class="modal-wrapper hidden" />').appendTo("body");
      modalDom    = $('<div class="modal" />').appendTo(overlayDom);
      modalHeader = $('<div class="modal-header" ><h3></h3><a class="close" >x</a></div>').appendTo(modalDom);
      modalBody   = $('<div class="modal-body" />').appendTo(modalDom);

      $(".close",modalHeader).click(() =>{
        this.close();
        return false;
      });

      overlayDom.click((e)=>{
        // close only on directly and not via children nodes
        if(e.target === overlayDom.get(0)){

          this.close();
          return false;
        }
      });

      $(window).resize(updateSize);

    },

    showIframe(url,title = null){
      return new Promise((resolve, reject) => {
        modalBody.html("");

        let iframe = $('<iframe src="'+url+'">').on("load",()=>{
          overlayDom.removeClass("hidden");
          this.show(title);
          resolve();
        }).appendTo(modalBody);
      });
    },

    close(){
      overlayDom.addClass("hidden");
    },

    show(title = null,triggerSizeUpdate = true){

      $("h3",modalHeader).html(title ? title : "");

      overlayDom.removeClass("hidden");

      if(triggerSizeUpdate)
        updateSize();
    }

  };

export {Modal};