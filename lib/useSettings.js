import { atom, useAtom } from "jotai";

const darkmodeAtom = atom(false)

export function useSettings() {
    const [darkmode, setDarkmode] = useAtom(darkmodeAtom);

    return {darkmode, setDarkmode}
}