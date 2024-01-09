import {atom} from 'jotai';

interface Event {
    eventName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
}

export const eventsAtom = atom<Event[]>([]);