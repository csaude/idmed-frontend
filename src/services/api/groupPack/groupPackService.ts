import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupPack from 'src/stores/models/group/GroupPack';
import db from 'src/stores/dexie';

const groupPack = useRepo(GroupPack);
const groupPackDexie = db[GroupPack.entity];

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupPack', params)
      .then((resp) => {
        groupPack.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupPack?offset=' + offset + '&max=100')
        .then((resp) => {
          groupPack.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupPack/' + id, params)
      .then((resp) => {
        groupPack.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupPack/' + id)
      .then(() => {
        groupPack.destroy(id);
      });
  },

  async apiFetchById(id: string) {
    return await api().get(`/groupPack/${id}`);
  },

  async apiSave(groupPack: any) {
    return await api().post('/groupPack', groupPack);
  },

  async apiUpdate(groupPack: any) {
    return await api().post('/groupPack', groupPack);
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return groupPack.getModel().$newInstance();
  },
  getAllFromStorage() {
    return groupPack.all();
  },

  getGroupPackByHeaderId(groupHeaderId: string) {
    return groupPack
      .query()
      .with('pack')
      .where('header_id', groupHeaderId)
      .get();
  },

  // Dexie Block
  async getByIdFromDexie(id: string) {
    return groupPackDexie.get(id);
  },
};
