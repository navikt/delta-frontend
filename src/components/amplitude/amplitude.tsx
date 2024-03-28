import { init } from "@amplitude/analytics-browser";

export const initAmplitude = () => {
    // @ts-ignore
    if (window.location.hostname === 'localhost') {
        return;
    }

    init("8cb400ce4d4338556a15507df2480a53", undefined, {
        serverUrl: "https://amplitude.nav.no/collect",
        serverZone: "EU",
        defaultTracking: {
            pageViews: true,
            sessions: true,
        },
    });
};

export default initAmplitude;