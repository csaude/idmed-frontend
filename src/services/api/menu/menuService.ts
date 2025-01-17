import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Menu from 'src/stores/models/userLogin/Menu';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const menu = useRepo(Menu);
const menuDexie = db[Menu.entity];

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
    if (isMobile.value) {
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
      const resp = await api().post('menu', params);
      menu.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('menu?offset=' + offset + '&max=100')
        .then((resp) => {
          menu.save(resp.data);
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
      const resp = await api().patch('menu/' + uuid, params);
      menu.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('menu/' + uuid);
      menu.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return menuDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        menu.save(JSON.parse(JSON.stringify(params)));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return menuDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        menu.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return menuDexie
      .toArray()
      .then((rows: any) => {
        menu.save(rows);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return menuDexie
      .delete(paramsId)
      .then(() => {
        menu.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return menuDexie
      .bulkPut(params)
      .then(() => {
        menu.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll() {
    return await api().get('/menu');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return menu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return menu.all();
  },
  getAll() {
    return menu.query().withAll().get();
  },
};
