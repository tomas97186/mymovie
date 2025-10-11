import { MembershipEnum } from '../enum/membership.enum';
import { ListPartialModel } from './list.partial.model';

export interface MembershipModel {
  uid: string;
  id: string;
  status: MembershipEnum;
  list: ListPartialModel;
}
