import {atom} from "jotai";

interface Event {
    eventName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
}

const sidebarOpenAtom = atom<boolean>(true);
export {sidebarOpenAtom};
