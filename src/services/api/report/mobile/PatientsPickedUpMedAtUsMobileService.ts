import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import PatientPickedUpMedAtUsReport from 'src/stores/models/report/pharmacyManagement/PatientPickedUpMedAtUsReport';
import clinicService from '../../clinicService/clinicService';
import packService from '../../pack/packService';
const patientPickedUpMedAtUsDexie = db[PatientPickedUpMedAtUsReport.entity];

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    const mainClinic =
      clinicService.currClinic() !== null ? clinicService.currClinic().id : '';
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

      if (
        identifier.service.id === reportParams.clinicalService &&
        mainClinic !== pack.origin
      ) {
        const patientPickedUpMedAtUs = new PatientPickedUpMedAtUsReport();
        patientPickedUpMedAtUs.dispenseType = dispenseType.description;

        patientPickedUpMedAtUs.reportId = reportParams.id;
        patientPickedUpMedAtUs.year = reportParams.year;
        patientPickedUpMedAtUs.startDate = reportParams.startDate;
        patientPickedUpMedAtUs.endDate = reportParams.endDate;
        patientPickedUpMedAtUs.nid = identifier.value;
        patientPickedUpMedAtUs.firstNames = patient.firstNames;
        patientPickedUpMedAtUs.middleNames = patient.middleNames;
        patientPickedUpMedAtUs.lastNames = patient.lastNames;
        patientPickedUpMedAtUs.cellphone = patient.cellphone;
        patientPickedUpMedAtUs.pickUpDate = pack.pickupDate;
        patientPickedUpMedAtUs.nexPickUpDate = pack.nextPickUpDate;
        patientPickedUpMedAtUs.therapeuticalRegimen =
          therapeuticRegimen.description;

        patientPickedUpMedAtUs.dispenseMode = pack.dispenseMode.description;
        patientPickedUpMedAtUs.clinicalService = identifier.service.description;
        patientPickedUpMedAtUs.clinic = pack.clinic.clinicName;
        patientPickedUpMedAtUs.id = uuidv4();
        this.localDbAddOrUpdate(patientPickedUpMedAtUs);
        console.log(patientPickedUpMedAtUs);
      }
    }

    // const patientVisitDetailsList =
    //   await patientVisitDetailsService.getLocalDbPatientVisitsPickedUpAtUs(
    //     reportParams.clinicalService,
    //     reportParams.startDate,
    //     reportParams.endDate
    //   );
    // for (const patientVisitDetail of patientVisitDetailsList) {
    //   if (patientVisitDetail.pack !== undefined) {
    //     const patientPickedUpMedAtUs = new PatientPickedUpMedAtUsReport();

    //     const dispenseType = dispenseTypeService.getById(
    //       patientVisitDetail.prescription.prescriptionDetails[0].dispenseType.id
    //     );
    //     let patientVisit = patientVisitDetail.patientVisit;
    //     if (patientVisit === null) {
    //       patientVisit = await patientVisitService.getAllMobileById(
    //         patientVisitDetail.patient_visit_id
    //       );
    //     }
    //     const patient = await patientService.getPatientByIdMobile(
    //       patientVisit.patient.id
    //     );

    //     const episode = await episodeService.apiFetchById(
    //       patientVisitDetail.episode.id
    //     );

    //     let identifier = patient.identifiers.find(
    //       (identifier: Object) =>
    //         identifier.id === episode.patientServiceIdentifier.id
    //     );
    //     if (!identifier)
    //       identifier = await patientServiceIdentifierService.localDbGetById(
    //         patientVisitDetail.episode.patientServiceIdentifier.id
    //       );

    //     if (identifier) {
    //       // const serviceIdentifier = identifier
    //       const pack = patientVisitDetail.pack;
    //       const clinic = clinicService.getById(patientVisitDetail.clinic.id);
    //       const clinicalService = await clinicalServiceService.localDbGetById(
    //         identifier.service.id
    //       );
    //       const therapeuticRegimen = await therapeuticalRegimenService.getById(
    //         patientVisitDetail.prescription.prescriptionDetails[0]
    //           .therapeuticRegimen.id
    //       );
    //       const dispenseMode = await dispenseModeService.localDbGetById(
    //         pack.dispenseMode.id
    //       );
    //       // const episode = reportData.episode
    //       // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
    //       patientPickedUpMedAtUs.dispenseType = dispenseType.description;

    //       patientPickedUpMedAtUs.reportId = reportParams.id;
    //       // patientHistory.period = reportParams.periodTypeView
    //       patientPickedUpMedAtUs.year = reportParams.year;
    //       patientPickedUpMedAtUs.startDate = reportParams.startDate;
    //       patientPickedUpMedAtUs.endDate = reportParams.endDate;
    //       patientPickedUpMedAtUs.nid = identifier.value;
    //       patientPickedUpMedAtUs.firstNames = patient.firstNames;
    //       patientPickedUpMedAtUs.middleNames = patient.middleNames;
    //       patientPickedUpMedAtUs.lastNames = patient.lastNames;
    //       patientPickedUpMedAtUs.cellphone = patient.cellphone;
    //       // patientHistory.tipoTarv =
    //       patientPickedUpMedAtUs.pickUpDate = pack.pickupDate;
    //       patientPickedUpMedAtUs.nexPickUpDate = pack.nextPickUpDate;
    //       patientPickedUpMedAtUs.therapeuticalRegimen =
    //         therapeuticRegimen.description;

    //       patientPickedUpMedAtUs.dispenseMode = dispenseMode.description;
    //       patientPickedUpMedAtUs.clinicalService = clinicalService.description;
    //       patientPickedUpMedAtUs.clinic = clinic.clinicName;
    //       patientPickedUpMedAtUs.id = uuidv4();
    //       this.localDbAddOrUpdate(patientPickedUpMedAtUs);
    //       console.log(patientPickedUpMedAtUs);
    //     }
    //   }
    // }
  },

  localDbAddOrUpdate(data: any) {
    return patientPickedUpMedAtUsDexie.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return patientPickedUpMedAtUsDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
