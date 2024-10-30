import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientHistoryReport from 'src/stores/models/report/pharmacyManagement/PatientHistoryReport';
import packService from '../../pack/packService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from '../../clinicService/clinicService';
const patientHistoryReporDexie = db[patientHistoryReport.entity];
// const activeInDrugStore = useRepo(ActiveInDrugStore);

const { idadeReportCalculator } = useDateUtils();
export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    console.log(reportParams);

    const [activePacks] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const pack of activePacks) {
      const patient = pack.patientvisitDetails.patientVisit.patient;
      const identifier =
        pack.patientvisitDetails.episode.patientServiceIdentifier;
      const therapeuticRegimen =
        pack.patientvisitDetails.prescription.prescriptionDetails
          .therapeuticRegimen;

      const dispenseType =
        pack.patientvisitDetails.prescription.prescriptionDetails.dispenseType;

      if (identifier.service.id === reportParams.clinicalService) {
        const patientHistory = new patientHistoryReport();
        patientHistory.reportId = reportParams.id;
        patientHistory.year = reportParams.year;
        patientHistory.startDate = reportParams.startDate;
        patientHistory.endDate = reportParams.endDate;
        patientHistory.dispenseType = dispenseType.description;
        patientHistory.nid = identifier.value;
        patientHistory.firstNames = patient.firstNames;
        patientHistory.middleNames = patient.middleNames;
        patientHistory.lastNames = patient.lastNames;
        patientHistory.cellphone = patient.cellphone;
        patientHistory.pickUpDate = pack.pickupDate;
        patientHistory.nexPickUpDate = pack.nextPickUpDate;
        patientHistory.therapeuticalRegimen = therapeuticRegimen.description;
        patientHistory.age = idadeReportCalculator(patient.dateOfBirth);
        patientHistory.dispenseMode = pack.dispenseMode.description;
        patientHistory.clinicalService = identifier.service.description;
        patientHistory.clinic = pack.clinic.clinicName;
        patientHistory.clinicsector = clinicService.currClinic().clinicName;
        patientHistory.id = uuidv4();
        this.localDbAddOrUpdate(patientHistory);
        console.log(patientHistory);
      }
    }

    // const patientVisitList =
    //   await patientVisitService.getLocalOnlyPatientVisitsBetweenDates(
    //     reportParams.startDate,
    //     reportParams.endDate
    //   );
    // for (const patientVisit of patientVisitList) {
    //   for (const patientVisitDetail of patientVisit.patientVisitDetails) {
    //     if (patientVisitDetail.pack !== undefined) {
    //       const pickupDate = moment(patientVisitDetail.pack.pickupDate).format(
    //         'YYYY-MM-DD'
    //       );
    //       const endDate = moment(params.endDate).format('YYYY-MM-DD');
    //       const startDate = moment(params.startDate).format('YYYY-MM-DD');
    //       const days = moment(endDate).diff(pickupDate, 'days');
    //       const newDate = moment(patientVisitDetail.pack.pickupDate).add(
    //         days,
    //         'd'
    //       );

    //       if (
    //         (patientVisit.visitDate >= reportParams.startDate &&
    //           patientVisit.visitDate <= reportParams.endDate) ||
    //         (newDate >= moment(params.startDate) &&
    //           newDate <= moment(params.endDate))
    //       ) {
    //         let identifier;
    //         const patientHistory = new patientHistoryReport();
    //         const idPatient = patientVisit.patient.id;
    //         const patient = await patientService.getPatientByIdMobile(
    //           idPatient
    //         );
    //         if (patient.identifiers.length > 0) {
    //           identifier = patient.identifiers[0];
    //         }
    //         if (!identifier) {
    //           identifier =
    //             await patientServiceIdentifierService.localDbGetByPatientId(
    //               idPatient
    //             );
    //         }
    //         if (identifier.service.id === reportParams.clinicalService) {
    //           patientHistory.reportId = reportParams.id;
    //           // patientHistory.period = reportParams.periodTypeView
    //           patientHistory.year = reportParams.year;
    //           patientHistory.startDate = reportParams.startDate;
    //           patientHistory.endDate = reportParams.endDate;
    //           // const serviceIdentifier = identifier
    //           let pack = patientVisitDetail.pack;
    //           let prescription = patientVisitDetail.prescription;
    //           if (pack.pickupDate === null || pack.pickupDate === undefined) {
    //             pack = await packService.getPackMobileById(pack.id);
    //           }
    //           if (
    //             prescription.prescriptionDate === null ||
    //             prescription.prescriptionDate === undefined
    //           ) {
    //             prescription =
    //               await prescriptionService.getPrescriptionMobileById(
    //                 prescription.id
    //               );
    //           }
    //           console.log(patientVisitDetail.clinic.id);
    //           const clinic = clinicService.getById(
    //             patientVisitDetail.clinic.id
    //           );
    //           const clinicalService =
    //             await clinicalServiceService.localDbGetById(
    //               identifier.service.id
    //             );
    //           const therapeuticRegimen =
    //             await therapeuticalRegimenService.getById(
    //               prescription.prescriptionDetails[0].therapeuticRegimen.id
    //             );
    //           const dispenseMode = await dispenseModeService.localDbGetById(
    //             pack.dispenseMode.id
    //           );
    //           // const episode = reportData.episode
    //           // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)

    //           const dispenseType = await dispenseTypeService.getById(
    //             prescription.prescriptionDetails[0].dispenseType.id
    //           );
    //           patientHistory.dispenseType = dispenseType.description;
    //           patientHistory.nid = identifier.value;
    //           patientHistory.firstNames = patient.firstNames;
    //           patientHistory.middleNames = patient.middleNames;
    //           patientHistory.lastNames = patient.lastNames;
    //           patientHistory.cellphone = patient.cellphone;
    //           // patientHistory.tipoTarv =
    //           patientHistory.pickUpDate = pack.pickupDate;
    //           patientHistory.nexPickUpDate = pack.nextPickUpDate;
    //           patientHistory.therapeuticalRegimen =
    //             therapeuticRegimen.description;
    //           patientHistory.age = idadeReportCalculator(patient.dateOfBirth);
    //           patientHistory.dispenseMode = dispenseMode.description;
    //           patientHistory.clinicalService = clinicalService.description;
    //           patientHistory.clinic = clinic.clinicName;
    //           patientHistory.clinicsector =
    //             clinicService.currClinic().clinicName;
    //           patientHistory.id = uuidv4();
    //           this.localDbAddOrUpdate(patientHistory);
    //           console.log(patientHistory);
    //         }
    //       }
    //     }
    //   }
    // }
  },

  localDbAddOrUpdate(data: any) {
    return patientHistoryReporDexie.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  localDbGetAllByReportId(reportId: any) {
    return patientHistoryReporDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
