import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';

export default class StockCenter extends Model {
  static entity = 'stockCenters';

  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(''),
      prefered: this.boolean(false),
      code: this.attr(''),
      syncStatus: this.attr(''),
      clinic_id: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }

}
