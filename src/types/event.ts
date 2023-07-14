export type CreateDeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

export type DeltaEventWithParticipant = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
};

export type DeltaEvent = {
  id: string;
  ownerEmail: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string | null;
};

export type DeltaParticipant = {
  email: string;
};
