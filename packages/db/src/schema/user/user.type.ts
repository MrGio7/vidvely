export interface CreateUserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  meetingId?: string;
}
