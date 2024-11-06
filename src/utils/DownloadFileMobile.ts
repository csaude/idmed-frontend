import moment from 'moment';
export default {
  downloadFile(fileName, fileType, blop, loading) {
    const titleFile =
      fileName + moment(new Date()).format('DD-MM-YYYY_HHmmss') + fileType;
    console.log('result' + titleFile);
    saveBlob2File(titleFile, blop);

    function saveBlob2File(fileName, blob) {
      const folder = cordova.file.externalRootDirectory + 'Download';
      window.resolveLocalFileSystemURL(
        folder,
        function (dirEntry) {
          createFile(dirEntry, fileName, blob);
        },
        onErrorLoadFs
      );
    }

    function createFile(dirEntry, fileName, blob) {
      dirEntry.getFile(
        fileName,
        { create: true, exclusive: false },
        function (fileEntry) {
          writeFile(fileEntry, blob);
        },
        onErrorCreateFile
      );
    }

    function writeFile(fileEntry, dataObj) {
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function () {
          console.log('Successful file write...');
          openFile();
        };

        fileWriter.onerror = function (error) {
          loading.value = false
          console.log('Failed file write: ' + error);
        };
        fileWriter.write(dataObj);
      });
    }

    function onErrorLoadFs(error) {
      loading.value = false
      console.log(error);
    }

    function onErrorCreateFile(error) {
      loading.value = false
      console.log('errorr: ' + error.toString());
    }

    function openFile() {
      const strTitle = titleFile;
      const folder =
        cordova.file.externalRootDirectory + 'Download/' + strTitle;
      const documentURL = decodeURIComponent(folder);
      cordova.plugins.fileOpener2.open(documentURL, 'application/pdf', {
        error: function (e) {
          loading.value = false
          console.log('Report not processed: ' + e + documentURL);
        },
        success: function () {
          loading.value = false
          console.log('Report processed');
        },
      });
    }
  },
};
