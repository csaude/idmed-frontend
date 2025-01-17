import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupType from 'src/stores/models/groupType/GroupType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const { isMobile, isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const groupType = useRepo(GroupType);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupType', params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupType/' + id, params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupType/' + id)
      .then(() => {
        groupType.destroy(id);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupType?offset=' + offset + '&max=100')
        .then((resp) => {
          groupType.save(resp.data);
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
  async apiGetAllWeb() {
    return await api()
      .get('/groupType')
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(GroupType.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        groupType.save(params);
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(GroupType.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        groupType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  get() {
    if (!isOnline.value) {
      this.getMobile();
    } else {
      this.apiGetAllWeb();
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return groupType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupType.all();
  },
};
