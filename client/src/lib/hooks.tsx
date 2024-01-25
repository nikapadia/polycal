import {atom} from "jotai";

interface Event {
    eventName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
}

const sidebarOpenAtom = atom<boolean>(true);
const currentDatesAtom = atom<[Date, Date]>([new Date(new Date().setDate(1)), new Date(new Date().setDate(31))]);

// hacky way to swipe calendar that probably won't work
const swipeCalendarAtom = atom<number>(0); // 0 = current month, 1 = next month, -1 = previous month

export {sidebarOpenAtom, currentDatesAtom, swipeCalendarAtom};
