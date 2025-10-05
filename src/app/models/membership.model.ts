import { MembershipEnum } from "../enum/membership.enum"
import { ListPartialModel } from "./list.partial.model"

export interface MembershipModel {
    uid: string
    status: MembershipEnum,
    list: ListPartialModel
}