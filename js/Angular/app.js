// MODULE
/*global angular*/
var MosqueApp = angular.module("MosqueApp", []);

MosqueApp.controller("PrayerTimingController", [
  "$scope",
  "$timeout",
  "$http",
  function ($scope, $timeout, $http) {
    var today, updatePrayerTimeTable, TodayTiming, now, day, minutes, iqama, athan, hijriCorrection;
    $scope.tickInterval = 1000; // ms, should change to an hour when pulling date from server

    $scope.date = Date.now(); // get the current time

    // clock and date data and timer
    var clock = function () {
      $scope.date = Date.now(); // get the current time
      $timeout(clock, $scope.tickInterval); // reset the timer
    };

    // update prayer timing table
    today = new Date();
    TodayTiming = getPrayerTiming(today);
    $scope.Prayers = TodayTiming.Prayers;
    $scope.Notes = TodayTiming.Notes;
    hijriCorrection = -1;
    $scope.hijriDate = hijriDate(hijriCorrection);

    updatePrayerTimeTable = function () {
      // a request to server to get date will go here
      var tomorrow = new Date();
      if (today.getDate() !== tomorrow.getDate()) {
        today = tomorrow;
        TodayTiming = getPrayerTiming(today);
        $scope.Prayers = TodayTiming.Prayers;
        $scope.Notes = TodayTiming.Notes;
        $scope.hijriDate = hijriDate(hijriCorrection);
      }
      $timeout(updatePrayerTimeTable, $scope.tickInterval); // reset the timer
    };

    // count down timer
    now = $scope.date; // get the current time
    var countDownTimer = function () {
      now = $scope.date; // get the current time
      day = today.getDay(); // Friday will return 5
      $scope.timeUntilIqama = null;
      for (i = 0; i < $scope.Prayers.length; i++) {
        iqama = $scope.Prayers[i].Iqama;
        athan = $scope.Prayers[i].Athan;
        minutes = (iqama - now) / 60000;
        if (minutes < 2 && minutes > 0 && !($scope.Prayers[i].Prayer === "Duhr" && day === 5)) {
          $scope.timeUntilIqama = iqama - now;
          $scope.nextPrayer = $scope.Prayers[i].Prayer;
        }

        if (athan < now && iqama > now && $scope.Prayers[i].Prayer !== "Sunrise" && !($scope.Prayers[i].Prayer === "Duhr" && day === 5)) {
          $scope.Prayers[i].current = true;
        } else {
          $scope.Prayers[i].current = false;
        }
      }
      $timeout(countDownTimer, $scope.tickInterval); // reset the timer
    };

    // start the timer
    $timeout(clock, $scope.tickInterval);
    // start the timer
    $timeout(updatePrayerTimeTable, $scope.tickInterval);
    // start the timer
    $timeout(countDownTimer, $scope.tickInterval);
  },
]);

MosqueApp.controller("UpcomingEventsController", [
  "$scope",
  "$timeout",
  "$http",
  function ($scope, $timeout, $http) {
    var events;
    $http
      .get("/events")
      .success(function (data, status, headers, config) {
        events = data;
        $scope.tickInterval = 10000; // ms
        $scope.i = 0;
        $scope.events = events; // get the current time

        var tick = function () {
          if ($scope.i === events.length - 1) {
            $scope.i = 0;
          } else {
            $scope.i++;
          }
          $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // start the timer
        $timeout(tick, $scope.tickInterval);
      })
      .error(function (data, status, headers, config) {
        // log error
        events = [];
      });
  },
]);
