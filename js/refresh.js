function timedRefresh(timeoutPeriod) {
    setTimeout("location.reload(true);", timeoutPeriod);
}

window.onload = timedRefresh(1000*60*60*24);
