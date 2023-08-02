export type CreateDeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  public: boolean;
  participantLimit: number;
  signupDeadline?: string;
};

export type FullDeltaEvent = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  hosts: DeltaParticipant[];
  categories: Category[];
};

export type DeltaEvent = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  public: boolean;
  participantLimit: number;
  signupDeadline?: string;
};

export type DeltaParticipant = {
  email: string;
  name: string;
};

export type ChangeDeltaParticipant = {
  email: string;
  type: "PARTICIPANT" | "HOST";
};

export type Category = {
  id: number;
  name: string;
};
