// @ts-nocheck
var uploader = new ss.SimpleUpload(
  {
    button: $('#uploadModel'), // file upload button
    url: '/Home/UploadFile', // server side handler
    name: 'uploadfile', // upload parameter name    
    responseType: 'json',
    allowedExtensions: ["json", "stl", "DAE", "PLY"],
    hoverClass: 'ui-state-hover',
    focusClass: 'ui-state-focus',
    disabledClass: 'ui-state-disabled',
    maxSize: 40000,
    dropzone: $('body'),
    onComplete: function (filename, response, btn) {
      if (!response) {
        alert(filename + 'upload failed');
        return false;
      }

      if (filename.toUpperCase().indexOf("STL") >= 0) {
        loadSTL(response);
        btn.innerText = filename;
      }
      else if (filename.toUpperCase().indexOf("JSON") >= 0) {
        loadModel(JSON.parse(response.model));
        btn.innerText = filename;
      }
      else if (filename.toUpperCase().indexOf("DAE") >= 0) {

        loadDAE();
        btn.innerText = filename;
      }
      else if (filename.toUpperCase().indexOf("PLY") >= 0) {
        loadPLY();
        btn.innerText = filename;
      }
      // do something with response...
    },
    onSizeError: function (filename, fileSize) {
      alert(filename + 'has size' + fileSize);

    }
  }


  );

