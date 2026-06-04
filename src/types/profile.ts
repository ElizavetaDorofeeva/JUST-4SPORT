export enum Sport {
  VOLLEYBALL = 'VOLLEYBALL',
  BASKETBALL = 'BASKETBALL',
  SOCCER = 'SOCCER',
  HOCKEY = 'HOCKEY',
  ULTIMATE = 'ULTIMATE'
}

export enum EventStatus {
  WILL_BE = 'WILL_BE',
  UNDERWAY = 'UNDERWAY',
  FINISHED = 'FINISHED'
}

export enum EventType {
  TRAINING = 'TRAINING',
  GAME = 'GAME',
  TOURNAMENT = 'TOURNAMENT'
}

export enum SkillLevel {
  START = 'START',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Photo {
  id: string;
  title: string;
  path: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  place: string;
  cost: number;
  sport: Sport;
  eventType: EventType;
  skillLevel: SkillLevel;
  eventStatus: EventStatus;
  photo?: Photo;
  deadline?: string;
  teamsNumber?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  photo?: Photo;
  favoriteSports: Sport[];
  authorEvents: Event[];
  participantEvents: Event[];
}