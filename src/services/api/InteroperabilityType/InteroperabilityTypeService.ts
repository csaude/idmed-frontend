import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityType from 'src/stores/models/interoperabilityType/InteroperabilityType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const interoperabilityType = useRepo(InteroperabilityType);
const interoperabilityTypeDexie = InteroperabilityType.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
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
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
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
  async postWeb(params: string) {
    try {
      const resp = await api().post('interoperabilityType', params);
      interoperabilityType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('interoperabilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('interoperabilityType/' + uuid, params);
      interoperabilityType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('interoperabilityType/' + uuid);
      interoperabilityType.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[interoperabilityTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        interoperabilityType.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[interoperabilityTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        interoperabilityType.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[interoperabilityTypeDexie]
      .toArray()
      .then((rows: any) => {
        interoperabilityType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[interoperabilityTypeDexie]
      .delete(paramsId)
      .then(() => {
        interoperabilityType.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[interoperabilityTypeDexie]
      .bulkPut(params)
      .then(() => {
        interoperabilityType.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/interoperabilityType/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityType.all();
  },
  getAll() {
    return interoperabilityType.query().withAll().get();
  },
};
