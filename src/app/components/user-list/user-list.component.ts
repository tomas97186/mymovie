import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InfoListModel } from 'src/app/models/movie-list.model';
import { UserListItemComponent } from "../user-list-item/user-list-item.component";
import { ListPartialModel } from 'src/app/models/list.partial.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [CommonModule, UserListItemComponent],
})
export class UserListComponent implements OnInit {

  userList = input.required<ListPartialModel[]>()

  invitations = input<boolean>(false);
  constructor() { }

  ngOnInit() { }

}
