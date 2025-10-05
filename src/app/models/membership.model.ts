import { MembershipEnum } from '../enum/membership.enum';
import { ListPartialModel } from './list.partial.model';

export interface MembershipModel {
  user: {
    uid: string;
    username: string;
  };
  id: string;
  status: MembershipEnum;
  list: ListPartialModel;
}
