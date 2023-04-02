import { MeetingService } from "./schema/meeting/meeting.service";
import { UserService } from "./schema/user/user.service";

export class DB {
  meeting: MeetingService;
  user: UserService;

  constructor() {
    this.meeting = new MeetingService();
    this.user = new UserService();
  }
}

export const db = new DB();
