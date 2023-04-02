export enum MeetingStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface CreateMeetingInput {
  id: string;
  data: string;
  userId: string;
}

export interface UpdateMeetingInput {
  id: string;
  data?: string;
  userId?: string;
  status?: MeetingStatus;
}
