import { Model } from 'pinia-orm';
import GroupMember from '../groupMember/GroupMember';
import GroupType from '../groupType/GroupType';
import ClinicalService from '../ClinicalService/ClinicalService';
import Clinic from '../clinic/Clinic';
import GroupPackHeader from './GroupPackHeader';
import { v4 as uuidv4 } from 'uuid';

export default class Group extends Model {
  static entity = 'groups';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      name: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(null),
      groupType_id: this.attr(''),
      clinical_service_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      groupType: this.belongsTo(GroupType, 'groupType_id'),
      members: this.hasMany(GroupMember, 'group_id'),
      service: this.belongsTo(ClinicalService, 'clinical_service_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      packHeaders: this.hasMany(GroupPackHeader, 'group_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
