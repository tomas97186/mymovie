import { FriendStatusEnum } from '../enum/friend-status.enum';
import { UserPartialModel } from './user.partial.model';

export interface FriendshipModel {
  user: UserPartialModel;
  status: FriendStatusEnum;
  createdDate: Date;
  acceptedDate?: Date;
  uid?: string;
}
