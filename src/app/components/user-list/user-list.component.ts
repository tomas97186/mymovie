import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { MembershipModel } from 'src/app/models/membership.model';
import { UserListItemComponent } from "../user-list-item/user-list-item.component";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [CommonModule, UserListItemComponent],
})
export class UserListComponent implements OnInit {

  userList = input.required<MembershipModel[]>()

  invitations = input<boolean>(false);
  constructor() { }

  ngOnInit() { }

}
