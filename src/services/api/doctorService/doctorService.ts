import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Doctor from 'src/stores/models/doctor/Doctor';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const doctor = useRepo(Doctor);
const doctorDexie = db[Doctor.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('doctor', params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('doctor?offset=' + offset + '&max=100')
        .then((resp) => {
          doctor.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('doctor/' + uuid, params)
      .then((resp) => {
        doctor.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('doctor/' + uuid)
      .then(() => {
        doctor.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return doctorDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        doctor.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return doctorDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        doctor.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return doctorDexie
      .toArray()
      .then((rows: any) => {
        doctor.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return doctorDexie
      .put(paramsId)
      .then(() => {
        doctor.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return doctorDexie
      .bulkPut(params)
      .then(() => {
        doctor.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return doctor.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAlldoctors() {
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .where('active', true)
      .orderBy('firstnames')
      .get();
  },
  getAllActiveAndNonActivedoctors() {
    return doctor
      .with('clinic', (query) => {
        query.with('province');
        query.with('district');
        query.with('facilityType');
      })
      .orderBy('firstnames')
      .get();
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await doctorDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
};
