import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import * as ExcelJS from 'exceljs';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';

const { isMobile, isOnline } = useSystemUtils();
const reportName = 'PacientesEmDS';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'Lista de Pacientes em Dispensa Semestral';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);
let novosExcel = 0;
let manutencaoExcel = 0;
let transporteExcel = 0;

export default {
  async downloadPDF(province, startDate, endDate, result) {
    const clinic = clinicService.currClinic();
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    const firstObject = result[0];
    // const totalPagesExp = '{total_pages_count_string}'

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const image = new Image();
    // image.src = '/src/assets/MoHLogo.png'
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;

    const headerReport = [
      [
        {
          content: 'Pacientes em Dispensa Semestral',
          styles: { minCellHeight: 25, fontSize: 16, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Unidade Sanitária: ' + clinic.clinicName,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Período: ' + startDate + ' à ' + endDate,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
      [
        {
          content: 'Distrito: ' + firstObject.district,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Província: ' + province,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + firstObject.year,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
    ];


    autoTable(doc, {
      bodyStyles: {
        halign: 'left',
        valign: 'middle',
        fontSize: 8,
      },
      headStyles: {
        halign: 'left',
        valign: 'middle',
      },
      theme: 'grid',
      body: headerReport,
    });

    doc.setFontSize(8);
    doc.text('República de Moçambique ', 16, 28);
    doc.text('Ministério da Saúde ', 20, 32);
    doc.text('Serviço Nacional de Saúde ', 16, 36);
    doc.addImage(image, 'png', 28, 15, 10, 10);

    const cols = [
      'ORD',
      'NID',
      'Nome',
      'Idade',
      'Data da Prescrição',
      'Tipo Paciente',
      'Linha Terapêutica',
      'Regime Terapêutico',
      'Data Levant.',
      'Data Prox. Levant.',
    ];

    const rows = result;
    const data = [];
    let ord = 1;

    let novos = 0;
    let manutencao = 0;
    let transporte = 0;

    for (const row in rows) {
      if (rows[row].patientType === 'Inicio') {
        novos = novos + 1;
      } else if (rows[row].patientType === 'DS - TRANSPORTE') {
        transporte = transporte + 1;
      } else {
        manutencao = manutencao + 1;
      }

      const createRow = [];
      createRow.push(ord);
      createRow.push(rows[row].nid);
      createRow.push(rows[row].firstNames + ' ' + rows[row].lastNames);
      createRow.push(rows[row].age);
      createRow.push(
        moment(new Date(rows[row].prescriptionDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].patientType);
      createRow.push(rows[row].therapeuticLine);
      createRow.push(rows[row].therapeuticRegimen);
      createRow.push(
        moment(new Date(rows[row].pickupDate)).format('DD-MM-YYYY')
      );
      createRow.push(
        moment(new Date(rows[row].nextPickUpDate)).format('DD-MM-YYYY')
      );

      data.push(createRow);
      ord += 1;
    }
    ord = 0;

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
        fillColor: [75, 76, 77],
      },
      styles: {
        maxCellHeight: 4,
      },
      head: [
        [
          {
            content: 'Qualificação dos Pacientes',
            colSpan: 2,
            styles: {
              halign: 'center',
              fillColor: [75, 76, 77],
              fontStyle: 'bold',
            },
          },
        ],
      ],
      body: [
        [
          {
            content: 'TIPO',
            styles: {
              halign: 'center',
              fillColor: [75, 76, 77],
              fontStyle: 'bold',
              textColor: [255, 255, 255],
            },
          },
          {
            content: 'TOTAL',
            styles: {
              halign: 'center',
              fillColor: [75, 76, 77],
              fontStyle: 'bold',
              textColor: [255, 255, 255],
            },
          },
        ],
        [
          { content: 'Novos', styles: { halign: 'center' } },
          { content: novos, styles: { halign: 'center' } },
        ],
        [
          { content: 'Manutenção', styles: { halign: 'center' } },
          { content: manutencao, styles: { halign: 'center' } },
        ],
        [
          { content: 'Manutenção Transporte', styles: { halign: 'center' } },
          { content: transporte, styles: { halign: 'center' } },
        ],
        [
          { content: 'Cumulativo em DS', styles: { halign: 'center' } },
          {
            content: novos + manutencao + transporte,
            styles: { halign: 'center' },
          },
        ],
      ],
      startY: doc.lastAutoTable.finalY + 5,
    });

    autoTable(doc, {
      bodyStyles: {
        halign: 'center',
        fontSize: 8,
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 30 },
      },
      didDrawPage: function (data) {
        const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        doc.text(str, data.settings.margin.right, pageHeight - 10);
      },
      startY: doc.lastAutoTable.finalY,
      theme: 'grid',
      head: [cols],
      body: data,
    });

    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesActivos.pdf')
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      this.downloadFile(fileName, 'pdf', pdfOutput);
    }
  },
  async downloadExcel(province, startDate, endDate, result, params) {
    const clinic = clinicService.currClinic();
    const rows = result;
    const data = this.createArrayOfArrayRow(rows);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FGH';
    workbook.lastModifiedBy = 'FGH';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png',
    });

    // Get Cells
    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellDistrict = worksheet.getCell('A12');
    const cellProvince = worksheet.getCell('D12');
    const cellStartDate = worksheet.getCell('I11');
    const cellEndDate = worksheet.getCell('I12');
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrictParamValue = worksheet.getCell('B12');
    const cellProvinceParamValue = worksheet.getCell('E12');
    const cellStartDateParamValue = worksheet.getCell('J11');
    const cellEndDateParamValue = worksheet.getCell('J12');
    const cellQuantificacao = worksheet.getCell('A14');
    const cellTipoPaciente = worksheet.getCell('A15');
    const cellNovos = worksheet.getCell('A16');
    const cellManutencao = worksheet.getCell('A17');
    const cellTransporte = worksheet.getCell('A18');
    const cellCumulativo = worksheet.getCell('A19');
    const cellTotalPacientePerTipo = worksheet.getCell('B15');
    const cellTotalNovos = worksheet.getCell('B16');
    const cellTotalManutencao = worksheet.getCell('B17');
    const cellTotalTransporte = worksheet.getCell('B18');
    const cellTotalCumulativo = worksheet.getCell('B19');

    // Get Rows
    const headerRowQuantificacao = worksheet.getRow(14);
    const headerRow = worksheet.getRow(15);

    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');
    const colG = worksheet.getColumn('G');
    const colH = worksheet.getColumn('H');
    const colI = worksheet.getColumn('I');
    const colJ = worksheet.getColumn('J');

    // Format Table Cells
    // Alignment Format
    cellRepublica.alignment =
      cellTitle.alignment =
      headerRowQuantificacao.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };

    cellPharm.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };

    // Border Format
    cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellStartDate.border =
      cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border =
      cellQuantificacao.border =
      cellTipoPaciente.border =
      cellTotalPacientePerTipo.border =
      cellNovos.border =
      cellManutencao.border =
      cellTransporte.border =
      cellCumulativo.border =
      cellTotalNovos.border =
      cellTotalManutencao.border =
      cellTotalTransporte.border =
      cellTotalCumulativo.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

    cellQuantificacao.fill =
      cellTipoPaciente.fill =
      cellTotalPacientePerTipo.fill =
        {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1fa37b' },
          bgColor: { argb: '1fa37b' },
        };
    cellQuantificacao.font =
      cellTipoPaciente.font =
      cellTotalPacientePerTipo.font =
        {
          name: 'Arial',
          color: { argb: 'FFFFFFFF' },
          family: 2,
          size: 11,
          italic: false,
          bold: true,
        };

    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPharmParamValue.value = result[0].clinic;
    cellProvinceParamValue.value = province;
    cellDistrictParamValue.value = result[0].district;
    cellStartDateParamValue.value = startDate;
    cellEndDateParamValue.value = endDate;
    cellPharm.value = 'Unidade Sanitária';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';
    cellQuantificacao.value = 'Qualificação dos Pacientes';

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:J10');
    worksheet.mergeCells('B11:H11');
    worksheet.mergeCells('B12:C12');
    worksheet.mergeCells('E12:H12');
    worksheet.mergeCells('A14:B14');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;
    headerRowQuantificacao.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 20;
    colB.width = 20;
    colC.width = 30;
    colD.width = 15;
    colE.width = 20;
    colF.width = 15;
    colG.width = 15;
    colH.width = 15;
    colI.width = 15;
    colJ.width = 20;

    // Add Style
    // cellTitle.font =
    cellDistrict.font =
      cellProvince.font =
      cellStartDate.font =
      cellEndDate.font =
      cellPharm.font =
        {
          name: 'Arial',
          family: 2,
          size: 11,
          italic: false,
          bold: true,
        };

    // Add Image
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 },
    });

    worksheet.addTable({
      name: reportName,
      ref: 'A15',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'Tipo', totalsRowLabel: 'none', filterButton: false },
        { name: 'Total', totalsRowLabel: 'Totals:', filterButton: false },
      ],
      rows: [
        ['Novos', novosExcel],
        ['Manutenção', manutencaoExcel],
        ['Transporte', transporteExcel],
        ['Cumulativo', novosExcel + manutencaoExcel + transporteExcel],
      ],
    });

    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A21',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        { name: 'Idade', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Data da Prescrição',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Tipo Paciente',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Linha Terapêutica',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Regime Terapêutico',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Data Levant.',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Data Prox. Levant.',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: data,
    });

    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0;
    const lastTableRowNum = lastRowNum;

    // Loop through all table's row
    for (let i = 21; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i);

      // Now loop through every row's cell and finally set alignment
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        if (i === 21) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' },
          };
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'PacientesActivos.xlsx';
      saveBlob2File(titleFile, blob);
      function saveBlob2File(fileName, blob) {
        const folder = cordova.file.externalRootDirectory + 'Download';
        //  var folder = 'Download'
        window.resolveLocalFileSystemURL(
          folder,
          function (dirEntry) {
            createFile(dirEntry, fileName, blob);
            // $q.loading.hide()
          },
          onErrorLoadFs
        );
      }
      function createFile(dirEntry, fileName, blob) {
        // Creates a new file
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
        // Create a FileWriter object for our FileEntry
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function () {
            console.log('Successful file write...');
            openFile();
          };

          fileWriter.onerror = function (error) {
            console.log('Failed file write: ' + error);
          };
          fileWriter.write(dataObj);
        });
      }
      function onErrorLoadFs(error) {
        console.log(error);
      }

      function onErrorCreateFile(error) {
        console.log('errorr: ' + error.toString());
      }
      function openFile() {
        const strTitle = titleFile;
        console.log('file system 44444: ' + strTitle);
        const folder =
          cordova.file.externalRootDirectory + 'Download/' + strTitle;
        console.log('file system 2222: ' + folder);
        const documentURL = decodeURIComponent(folder);
        cordova.plugins.fileOpener2.open(
          documentURL,
          'application/vnd.ms-excel',
          {
            error: function (e) {
              console.log('file system open3333366: ' + e + documentURL);
            },
            success: function () {},
          }
        );
      }
    }
  },
  createArrayOfArrayRow(rows) {
    const data = [];
    let ord = 1;

    for (const row in rows) {
      if (rows[row].patientType === 'Inicio') {
        novosExcel = novosExcel + 1;
      } else if (rows[row].patientType === 'DS - TRANSPORTE') {
        transporteExcel = transporteExcel + 1;
      } else {
        manutencaoExcel = manutencaoExcel + 1;
      }
      const createRow = [];
      createRow.push(ord);
      createRow.push(rows[row].nid);
      createRow.push(
        rows[row].firstNames +
          ' ' +
          rows[row].middleNames +
          ' ' +
          rows[row].lastNames
      );
      createRow.push(rows[row].age);
      createRow.push(
        moment(new Date(rows[row].prescriptionDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].patientType);
      createRow.push(rows[row].therapeuticLine);
      createRow.push(rows[row].therapeuticRegimen);
      createRow.push(
        moment(new Date(rows[row].pickupDate)).format('DD-MM-YYYY')
      );
      createRow.push(
        moment(new Date(rows[row].nextPickUpDate)).format('DD-MM-YYYY')
      );

      data.push(createRow);
      ord += 1;
    }
    ord = 0;
    rows = [];

    return data;
  },
  downloadFile(fileName, fileType, blop) {
    const titleFile = fileName + fileType;
    console.log('result' + titleFile);
    saveBlob2File(titleFile, blop);
    function saveBlob2File(fileName, blob) {
      const folder = cordova.file.externalRootDirectory + 'Download';
      //  var folder = 'Download'
      window.resolveLocalFileSystemURL(
        folder,
        function (dirEntry) {
          createFile(dirEntry, fileName, blob);
          // $q.loading.hide()
        },
        onErrorLoadFs
      );
    }
    function createFile(dirEntry, fileName, blob) {
      // Creates a new file
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
      // Create a FileWriter object for our FileEntry
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function () {
          console.log('Successful file write...');
          openFile();
        };

        fileWriter.onerror = function (error) {
          console.log('Failed file write: ' + error);
        };
        fileWriter.write(dataObj);
      });
    }
    function onErrorLoadFs(error) {
      console.log(error);
    }

    function onErrorCreateFile(error) {
      console.log('errorr: ' + error.toString());
    }
    function openFile() {
      const strTitle = titleFile;
      console.log('file system 44444: ' + strTitle);
      const folder =
        cordova.file.externalRootDirectory + 'Download/' + strTitle;
      console.log('file system 2222: ' + folder);
      const documentURL = decodeURIComponent(folder);
      cordova.plugins.fileOpener2.open(documentURL, 'application/pdf', {
        error: function (e) {
          console.log('file system open3333366: ' + e + documentURL);
        },
        success: function () {},
      });
    }
    // }
  },
};
