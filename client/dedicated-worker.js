const startDate = new Date();

setInterval(() => {
    const { hours, minutes, remainingSeconds } = splitSecondsInHoursMinutesSeconds(getSecondsSinceStart());

    postMessage({ message: `HRS: ${hours} MIN: ${minutes} S: ${remainingSeconds}` });
}, 1000);

function getSecondsSinceStart() {
    return Math.floor((new Date() - startDate) / 1000);
}

function splitSecondsInHoursMinutesSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return { hours, minutes, remainingSeconds };
}