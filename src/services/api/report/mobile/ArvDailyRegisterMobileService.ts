import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import { useRepo } from 'pinia-orm';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import packService from '../../pack/packService';

const arvDailyRegisterReportDexie = ArvDailyRegisterTempReport.entity;
const arvDailyRegisterRepo = useRepo(ArvDailyRegisterTempReport);

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
      const episode = pack.patientvisitDetails.episode;
      const identifier =
        pack.patientvisitDetails.episode.patientServiceIdentifier;
      const therapeuticLine =
        pack.patientvisitDetails.prescription.prescriptionDetails
          .therapeuticLine;
      const therapeuticRegimen =
        pack.patientvisitDetails.prescription.prescriptionDetails
          .therapeuticRegimen;
      const patientType =
        pack.patientvisitDetails.prescription.patientType === 'N/A'
          ? pack.patientvisitDetails.prescription.patientStatus
          : pack.patientvisitDetails.prescription.patientType;

      const dispenseType =
        pack.patientvisitDetails.prescription.prescriptionDetails.dispenseType;

      if (identifier.service.id === reportParams.clinicalService) {
        const arvDailyRegisterReport = new ArvDailyRegisterTempReport();
        arvDailyRegisterReport.reportId = reportParams.id;
        arvDailyRegisterReport.year = reportParams.year;
        arvDailyRegisterReport.startDate = reportParams.startDate;
        arvDailyRegisterReport.endDate = reportParams.endDate;

        arvDailyRegisterReport.nid = identifier.value;
        arvDailyRegisterReport.patientName =
          patient.firstNames +
          ' ' +
          patient.middleNames +
          ' ' +
          patient.lastNames;
        arvDailyRegisterReport.patientType = patientType;
        arvDailyRegisterReport.startReason = episode.startStopReason.reason;
        const age = this.idadeCalculator(patient.dateOfBirth);
        arvDailyRegisterReport.ageGroup_0_4 =
          age >= 0 && age < 4 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_5_9 =
          age >= 5 && age <= 9 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_10_14 =
          age >= 10 && age <= 14 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_Greater_than_15 =
          age >= 15 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.pickUpDate = pack.pickupDate;
        arvDailyRegisterReport.nexPickUpDate = pack.nextPickUpDate;
        arvDailyRegisterReport.regime = therapeuticRegimen.description;
        arvDailyRegisterReport.dispensationType = dispenseType.description;
        arvDailyRegisterReport.therapeuticLine = therapeuticLine.description;
        arvDailyRegisterReport.clinic = pack.clinic.clinicName;
        arvDailyRegisterReport.prep =
          clinicalServiceService.localDbGetById(reportParams.clinicalService)
            .code === 'PREP'
            ? 'Sim'
            : '';
        arvDailyRegisterReport.ppe =
          clinicalServiceService.localDbGetById(reportParams.clinicalService)
            .code === 'PPE'
            ? 'Sim'
            : '';
        const drugQuantityTemps = [];

        for (const packagedDrug of pack.packagedDrugs) {
          const drugQuantityTemp = {};
          drugQuantityTemp.drugName = packagedDrug.drug.name;
          drugQuantityTemp.quantity = packagedDrug.quantitySupplied;
          console.log(drugQuantityTemp);
          drugQuantityTemps.push(drugQuantityTemp);
          console.log(arvDailyRegisterReport);
        }
        console.log(drugQuantityTemps);
        arvDailyRegisterReport.drugQuantityTemps = drugQuantityTemps;
        arvDailyRegisterReport.id = uuidv4();
        this.localDbAddOrUpdate(arvDailyRegisterReport);
      }
    }

    // const patientVisits = await patientVisitService.localDbGetAllPatientVisit();
    // for (const patientVisit of patientVisits) {
    //   for (const patientVisitDetail of patientVisit.patientVisitDetails) {
    //     if (patientVisitDetail.pack !== undefined) {
    //       const pickupDate = moment(patientVisitDetail.pack.pickupDate).format(
    //         'YYYY-MM-DD'
    //       );
    //       const endDate = moment(params.endDate).format('YYYY-MM-DD');
    //       const days = moment(endDate).diff(pickupDate, 'days');
    //       const newDate = moment(patientVisitDetail.pack.pickupDate).add(
    //         days,
    //         'd'
    //       );

    //       const patient = await patientService.getPatientByIdMobile(
    //         patientVisit.patient.id
    //       );
    //       if (
    //         (patientVisit.visitDate >= reportParams.startDate &&
    //           patientVisit.visitDate <= reportParams.endDate) ||
    //         (newDate >= moment(params.startDate) &&
    //           newDate <= moment(params.endDate))
    //       ) {
    //         let identifier;
    //         if (patient.identifiers.length > 0) {
    //           identifier = patient.identifiers[0];
    //         }
    //         if (!identifier) {
    //           const identifierAux =
    //             await patientServiceIdentifierService.localDbGetByPatientId(
    //               patientVisit.patient.id
    //             );
    //           identifier = identifierAux[0];
    //         }
    //         if (identifier) {
    //           //patientVisitDetail.episode.patientServiceIdentifier
    //         }
    //       }
    //     }
    //   }
    // }
  },

  localDbAddOrUpdate(data: any) {
    return db[arvDailyRegisterReportDexie]
      .add(JSON.parse(JSON.stringify(data)))
      .then(() => {
        arvDailyRegisterRepo.save(data);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[arvDailyRegisterReportDexie]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },

  idadeCalculator(birthDate: string) {
    if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
      const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD');
      const todayDate = moment(new Date());
      const idade = todayDate.diff(utentBirthDate, 'years');
      console.log(idade);
      return idade;
    }
  },
};
