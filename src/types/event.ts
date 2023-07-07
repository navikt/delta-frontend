export type CreateDeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

export type DeltaEvent = {
  id: number;
  ownerEmail: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};
