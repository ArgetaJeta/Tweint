import { atom, useAtom } from "jotai";

// Define an atom to hold the state for dark mode, with a default value of 'false' (disabled)
const darkmodeAtom = atom(false)

// Custom hook to manage settings related to dark mode
export function useSettings() {
    // Use the 'useAtom' hook to access and update the 'darkmode' state
    // 'darkmode' holds the current state (true or false), 'setDarkmode' is the setter function to update the state
    const [darkmode, setDarkmode] = useAtom(darkmodeAtom);

    // Return both the 'darkmode' state and the setter function 'setDarkmode' so they can be used in components
    return {darkmode, setDarkmode}
}