import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import { useRepo } from 'pinia-orm';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import packService from '../../pack/packService';

const arvDailyRegisterReportDexie = db[ArvDailyRegisterTempReport.entity];
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
        pack.patientvisitDetails.prescription.prescriptionDetails[0]
          .therapeuticLine;
      const therapeuticRegimen =
        pack.patientvisitDetails.prescription.prescriptionDetails[0]
          .therapeuticRegimen;
      const patientType =
        pack.patientvisitDetails.prescription.patientType === 'N/A'
          ? pack.patientvisitDetails.prescription.patientStatus
          : pack.patientvisitDetails.prescription.patientType;

      const dispenseType =
        pack.patientvisitDetails.prescription.prescriptionDetails[0].dispenseType;

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
  },

  localDbAddOrUpdate(data: any) {
    return arvDailyRegisterReportDexie
      .add(JSON.parse(JSON.stringify(data)))
      .then(() => {
        arvDailyRegisterRepo.save(data);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    return arvDailyRegisterReportDexie
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
