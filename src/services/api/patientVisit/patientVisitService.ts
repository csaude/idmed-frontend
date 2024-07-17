import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import moment from 'moment';
import dispenseTypeService from '../dispenseType/dispenseTypeService';
import patientService from '../patientService/patientService';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import clinicService from '../clinicService/clinicService';
import prescriptionService from '../prescription/prescriptionService';
import packService from '../pack/packService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from '../episode/episodeService';
import ChunkArray from 'src/utils/ChunkArray';
import useNotify from 'src/composables/shared/notify/UseNotify';

const patientVisit = useRepo(PatientVisit);
const patientVisitDexie = PatientVisit.entity;

const { showloading, closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { notifySuccess } = useNotify();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }

    // params.syncStatus = 'R';
    //return this.addMobile(params);
    // return this.postWeb(params);
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('patientVisit', params)
      .then((resp) => {
        patientVisit.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientVisit?offset=' + offset + '&max=100')
        .then((resp) => {
          patientVisit.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patientVisit/' + uuid, params)
      .then((resp) => {
        patientVisit.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientVisit/' + uuid)
      .then(() => {
        patientVisit.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[patientVisitDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientVisit.save(params);
      });
  },
  putMobile(params: string) {
    return db[patientVisitDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientVisit.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    const rows = await db[patientVisitDexie].toArray();
    patientVisit.save(rows);
    return rows;
  },

  async getPatientVisitMobile() {
    const rows = await db[patientVisitDexie].toArray();
    const records = rows.filter(
      (row) =>
        row.syncStatus !== undefined &&
        row.syncStatus !== null &&
        row.syncStatus !== ''
    );

    return records;
  },

  async deleteMobile(paramsId: string) {
    try {
      await db[patientVisitDexie].delete(paramsId);
      patientVisit.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile(params: any) {
    return db[patientVisitDexie]
      .bulkPut(params)
      .then(() => {
        patientVisit.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/patientVisit/${id}`);
  },

  async apiSave(patientVisit: any) {
    return await this.post(patientVisit);
  },

  async apiUpdate(patientVisit: any) {
    return await this.patch(patientVisit.id, patientVisit);
  },

  async apiRemove(id: string) {
    return await this.delete(id);
  },

  async apiGetAllByPatientId(patientId: string) {
    if (isMobile.value && !isOnline.value) {
      const resp = await db[patientVisitDexie]
        .where('patientId')
        .equalsIgnoreCase(patientId)
        .toArray();
      patientVisit.save(resp);
      return resp;
    } else {
      const resp = await api().get('/patientVisit/patient/' + patientId);
      patientVisit.save(resp.data);
      return resp.data;
    }

    //  const resp = await api().get('/patientVisit/patient/' + patientId);
    // patientVisit.save(resp.data);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisit/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiGetAllLastWithScreeningOfClinic(
    clinicId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/patientVisit/AllLastWithScreeningOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetLastVisitOfPatient(patientId: string) {
    return await api().get('/patientVisit/getLastVisitOfPatient/' + patientId);
  },

  async getLocalDbPatientVisitsToSync() {
    return db[patientVisitDexie]
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisit.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisit.all();
  },
  deleteAllFromStorage() {
    patientVisit.flush();
  },
  saveInStorage(patientVisitParam: any) {
    return patientVisit.save(patientVisitParam);
  },
  getLastFourWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(2)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
  getAllWithVitalSignByPatientId(patientId: string) {
    return patientVisit
      .withAllRecursive(3)
      .where('patient_id', patientId)
      .limit(4)
      .has('vitalSignsScreenings')
      .orderBy('visitDate', 'desc')
      .get();
  },
  getLastFromEpisode(episodeId: string) {
    return patientVisit
      .withAllRecursive(2)
      .whereHas('patientVisitDetails', (query) => {
        query.has('prescription');
        query.where('episode_id', episodeId);
      })
      .orderBy('visitDate', 'desc')
      .first();
  },
  getLastFromPatientVisitList(patientvisitids: any) {
    return patientVisit
      .query()
      .withAllRecursive(2)
      .whereIn('id', patientvisitids)
      .orderBy('visitDate', 'desc')
      .first();
  },
  getPatientVisitById(patientVisitId: string) {
    return patientVisit
      .withAllRecursive(2)
      .where('id', patientVisitId)
      .orderBy('visitDate', 'desc')
      .first();
  },
  getAllFromPatient(patientId: string) {
    return patientVisit
      .withAll()
      .whereHas('patientVisitDetails', (query) => {
        query.has('prescription');
      })
      .where('patient_id', patientId)
      .orderBy('visitDate', 'desc')
      .get();
  },

  // Reports

  async getPatientNSql() {
    return db[patientVisitDexie].toArray().then((result: any) => {
      console.log(result);
      //  return result
    });
  },

  async getPatientVIsitNSqlByPatient(patient: any) {
    return db[patientVisitDexie]
      .where('id')
      .equalsIgnoreCase(patient.id)
      .first()
      .then((result: any) => {
        console.log(result);
        result.patientVisitDetails.forEach((pvd: any) => {
          if (pvd.prescription !== undefined)
            Prescription.insertOrUpdate({ data: pvd.prescription });
          if (pvd.pack !== undefined) Pack.insertOrUpdate({ data: pvd.pack });
        });
      });
  },

  // to check How to do it with Dexie
  /*
  async getVisits() {
    nSQL().onConnected(() => {
      nSQL(PatientVisit.entity)
        .query('select', [
          'JSON_EXTRACT(patientVisitDetails, "$[*].pack") as pack',
        ])
        .exec()
        .then((result) => {
          console.log(result);
        });
    });
  },
*/

  async localDbGetPacks() {
    const packList = [];
    return db[patientVisitDexie].toArray().then((result: any) => {
      for (const pvd of result) {
        for (const pvdObj of pvd.patientVisitDetails) {
          packList.push(pvdObj.pack);
        }
      }
      return packList;
    });
  },

  async localDbGetAllPatientVisit() {
    return db[patientVisitDexie].toArray().then((result: any) => {
      return result;
    });
  },

  async countPacksByDispenseTypeAndServiceOnPeriod(
    dispenseType: any,
    service: any,
    startDate: any,
    endDate: any
  ) {
    let counter = 0;
    return db[patientVisitDexie].toArray().then((result) => {
      for (const pv of result) {
        for (const pvd of pv.patientVisitDetails) {
          if (pvd.pack !== undefined) {
            const pickupDate = moment(pvd.pack.pickupDate);
            const dispenseTypeId =
              pvd.prescription.prescriptionDetails[0].dispenseType
                .identifierType;
            const codeDispenseType =
              dispenseTypeService.getById(dispenseTypeId);
            if (
              pickupDate >= startDate &&
              pickupDate <= endDate &&
              pvd.episode.patientServiceIdentifier.service.id === service &&
              codeDispenseType.code === dispenseType
            ) {
              counter++;
            }
          }
        }
      }
      return counter;
    });
  },

  async doPatientVisitServiceBySectorGet() {
    showloading();
    const patients = await patientService.getMobile();
    const ids = patients.map((pat: any) => pat.id);
    const clinicSector = clinicService.currClinic();
    console.log(ids);
    // ids.push(clinicSector);

    const limit = 100; // Define your limit
    const offset = 0; // Define your offset

    const chunks = ChunkArray.chunkArrayWithOffset(ids, limit, offset);
    const allVisits = [];
    for (const chunk of chunks) {
      const listParams = {
        ids: chunk,
        clinicSector: clinicSector,
      };

      const visitDetails = await api().post(
        'patientVisitDetails/getAllByPatientIds/',
        listParams
      );

      allVisits.push(...visitDetails.data);
    }

    patientVisitDetailsService.addBulkMobile(allVisits);

    const pvs = allVisits.map((pat: any) => pat.patientVisit);
    console.log(pvs);

    this.addBulkMobile(pvs);

    const idsPrescription = allVisits.map((vis: any) => vis.prescriptionId);
    const prescriptions = await prescriptionService.getPrescriptionsByIds(
      idsPrescription
    );
    console.log(prescriptions);

    const idsPacks = allVisits.map((vis: any) => vis.packId);
    const packs = await packService.getPacksByIds(idsPacks);
    console.log(packs);

    const episodeIds = patients.flatMap((data: any) =>
      data.identifiers.flatMap((data1: any) =>
        data1.episodes.map((episode: any) => episode.id)
      )
    );

    const episodes = await episodeService.getEpisodeByIds(episodeIds);
    console.log(episodes);
    const resp = await this.apiGetAllLastWithScreeningOfClinic(
      clinicSector.id,
      0,
      100
    );
    this.addBulkMobile(resp.data);
    closeLoading();
    notifySuccess('Carregamento de Dispensas Terminado');
    /*
    const idsVisit = visits.data.map((vis: any) => vis.patientVisitId);
    const idsPrescription = visits.data.map((vis: any) => vis.prescriptionId);
    const idsPacks = visits.data.map((vis: any) => vis.packId);
    console.log(idsVisit);
    console.log(idsPrescription);
    console.log(idsPacks);
*/
    /*
    const patientVisits = await api().post(
      '/patientVisit/getAllByVisitIds/',
      idsVisit
    );
    console.log(patientVisits);


    this.addBulkMobile(patientVisits.data);

    const prescriptions = await api().post(
      '/prescription/getAllByPrescriptionIds/',
      idsPrescription
    );

    const packs = await api().post('/pack/getAllByPackIds/', idsPacks);

    prescriptionService.addBulkMobile(prescriptions.data);

    packService.addBulkMobile(packs.data);

    const patientServices = await patientServiceIdentifierService.getMobile();

    // dataArray.flatMap(data => data.episodes.map(episode => episode.id));

    const episodeIds = patients.flatMap((data: any) =>
      data.identifiers.flatMap((data1: any) =>
        data1.episodes.map((episode: any) => episode.id)
      )
    );
    console.log(episodeIds);
    const episodes = await api().post(
      '/episode/getAllByEpisodeIds/',
      episodeIds
    );
    episodeService.addBulkMobile(episodes.data);
    console.log(episodes);
        */
  },

  /*
  chunkArrayWithOffset(array: [], limit: number, offset: number) {
    const result = [];
    let currentOffset = offset;

    while (currentOffset < array.length) {
      const chunk = array.slice(currentOffset, currentOffset + limit);
      result.push(chunk);
      currentOffset += limit;
    }

    return result;
  },
  */
};
