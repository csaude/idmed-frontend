import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const dispenseMode = useRepo(DispenseMode);
const dispenseModeDexie = db[DispenseMode.entity];

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
      const resp = await api().post('dispenseMode', params);
      dispenseMode.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('dispenseMode?offset=' + offset + '&max=100')
        .then((resp) => {
          dispenseMode.save(resp.data);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('dispenseMode/' + uuid, params);
      dispenseMode.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('dispenseMode/' + uuid);
      dispenseMode.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },

  async apiGetAll() {
    return await api().get('/dispenseMode');
  },

  async apiFetchById(id: string) {
    return await api().get(`/dispenseMode/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return dispenseMode.getModel().$newInstance();
  },
  getAllFromStorage() {
    return dispenseMode.all();
  },

  getAllFromDispenseModeType(dispenseModeType: string) {
    return dispenseMode
      .where((dispenseMode: any) => {
        return dispenseMode.code.includes(dispenseModeType);
      })
      .get();
  },

  // Dexie Block
  // Mobile
  addMobile(params: string) {
    return dispenseModeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        dispenseMode.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return dispenseModeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        dispenseMode.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return dispenseModeDexie
      .toArray()
      .then((rows: any) => {
        dispenseMode.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async localDbGetById(id: string) {
    return dispenseModeDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first()
      .then((result: any) => {
        return result;
      });
  },
  deleteMobile(paramsId: string) {
    return dispenseModeDexie
      .delete(paramsId)
      .then(() => {
        dispenseMode.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return dispenseModeDexie
      .bulkPut(params)
      .then(() => {
        dispenseMode.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getByIdFromDexie(id: string) {
    return await dispenseModeDexie.get(id);
  },
  async getAllByIDsFromDexie(ids: []) {
    return await dispenseModeDexie.where('id').anyOf(ids).toArray();
  },
};
