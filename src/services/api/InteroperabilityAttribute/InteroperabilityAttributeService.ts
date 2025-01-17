import db from '../../../stores/dexie';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import InteroperabilityAttribute from 'src/stores/models/interoperabilityAttribute/InteroperabilityAttribute';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const interoperabilityAttribute = useRepo(InteroperabilityAttribute);
const interoperabilityAttributeDexie = db[InteroperabilityAttribute.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('interoperabilityAttribute', params);
      interoperabilityAttribute.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('interoperabilityAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          interoperabilityAttribute.save(resp.data);
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
      const resp = await api().patch(
        'interoperabilityAttribute/' + uuid,
        params
      );
      interoperabilityAttribute.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('interoperabilityAttribute/' + uuid);
      interoperabilityAttribute.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return interoperabilityAttributeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        interoperabilityAttribute.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return interoperabilityAttributeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        interoperabilityAttribute.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return interoperabilityAttributeDexie
      .toArray()
      .then((rows: any) => {
        interoperabilityAttribute.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return interoperabilityAttributeDexie
      .delete(paramsId)
      .then(() => {
        interoperabilityAttribute.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return interoperabilityAttributeDexie
      .bulkPut(params)
      .then(() => {
        interoperabilityAttribute.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/interoperabilityAttribute?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return interoperabilityAttribute.getModel().$newInstance();
  },
  getAllFromStorage() {
    return interoperabilityAttribute.all();
  },
  saveLocalStorage(params: any) {
    return interoperabilityAttribute.save(params);
  },
  deleteAllFromHealthSystem(healthInformationSysytemId: string) {
    const attributes = interoperabilityAttribute
      .where('healthInformationSystem_id', healthInformationSysytemId)
      .get();
    attributes.forEach((attr) => {
      interoperabilityAttribute.destroy(attr.id);
    });
  },
};
