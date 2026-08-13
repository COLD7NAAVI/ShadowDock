/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Device Information Utility
|
| Responsibilities
|
| ✓ Generate persistent device identifier
| ✓ Detect operating system
| ✓ Detect browser
| ✓ Detect device type
| ✓ Detect CPU architecture (best effort)
| ✓ Supply metadata required by backend
|
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "shadowdock_device_identifier";

function generateIdentifier() {
    return crypto.randomUUID();
}

function getDeviceIdentifier() {

    let id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
        id = generateIdentifier();
        localStorage.setItem(STORAGE_KEY, id);
    }

    return id;
}

function getOperatingSystem() {

    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";

    return "Unknown";
}

function getBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Edg")) return "Microsoft Edge";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";

    return "Unknown";
}

function getDeviceType() {
    return /Mobi|Android|iPhone|iPad/i.test(
        navigator.userAgent
    )
        ? "mobile"
        : "desktop";
}
function getArchitecture() {

    return navigator.userAgentData?.architecture ??
        "unknown";
}

export function getDeviceInfo() {

    const browser = getBrowser();
    const os = getOperatingSystem();

    return {

        deviceIdentifier:
            getDeviceIdentifier(),

        deviceName:
            `${browser} on ${os}`,

        manufacturer:
            "Unknown",

        model:
            "Browser",

        deviceType:
            getDeviceType(),

        operatingSystem:
            os,

        osVersion:
            null,

        appVersion:
            import.meta.env.VITE_APP_VERSION,

        cpuArchitecture:
            getArchitecture()

    };
}

export default getDeviceInfo;