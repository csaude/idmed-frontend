import api from '../../api/apiService/apiService';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('episodeType?offset=' + offset + '&max=100')
        .then((resp) => {
          episodeTypeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: EpisodeType');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },
};
