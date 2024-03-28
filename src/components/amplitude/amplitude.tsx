import { init } from "@amplitude/analytics-browser";
const initAmplitude = (): boolean => {
    try {
        console.log("initAmplitude called"); // New log statement
        init("8cb400ce4d4338556a15507df2480a53", undefined, {
            serverUrl: `https://amplitude.nav.no/collect`,
            defaultTracking: {
                pageViews: true,
                sessions: true,
            },
        })
        console.log("Amplitude initialized")
        return true
    } catch (e) {
        console.error("Error initializing Amplitude", e)
        return false
    }
}
export default initAmplitude;