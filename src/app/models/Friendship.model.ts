import { FriendStatusEnum } from '../enum/friend-status.enum';
import { UserPartialModel } from './user.partial.model';

export interface FriendshipModel {
  sender: UserPartialModel;
  receiver: UserPartialModel;
  status: FriendStatusEnum;
  createdDate: Date;
  acceptedDate?: Date;
  id: string;
}
