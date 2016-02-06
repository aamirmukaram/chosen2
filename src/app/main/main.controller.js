(function () {
  'use strict';

  angular
    .module('chosen2')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $log, $timeout, ngAudio, $interval, $q, $http, AuthFactory, $state) {
    var vm = this;
    var data = null;
    var totalAudioFilesToLoad = 0;
    var deferredLoadData = $q.defer();
    vm.showSpinner = true;

    var init = function () {
      vm.data = data;
      vm.currentQuestionIndex = 0;
      vm.currentAssessmentIndex = 0;
      vm.selectedAnswerCategory = null;
      vm.selectedAnswerScore = 0;
      vm.graphData = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
      vm.tabActive = [];
      vm.isAssessmentEnded = false;
      vm.showSpinner = false;
      //Play first track
      vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.play();

    };
    var audioFileDownloaded = function (promise) {
      $interval.cancel(promise);
      totalAudioFilesToLoad--;
      if (totalAudioFilesToLoad == 0) {
        deferredLoadData.resolve();
      }
    }
    var loadData = function () {

      $http.get('assets/data/data.json').
        success(function (Data, status, headers, config) {
          data = Data;
          for (var y = 0; y < data.assessments.length; y++) {
            //Loading assessment audio files.
            for (var x = 0; x < data.assessments[y].questions.length; x++) {
              totalAudioFilesToLoad++;
              var audioFile = null;
              audioFile = ngAudio.load('assets/audio/' + data.assessments[y].questions[x].audio.filename); // returns
              // NgAudioObject
              data.assessments[y].questions[x].audio.object = audioFile;
              (function (audioFile, y, x) {
                var promise = $interval(function () {
                  if ('duration' in audioFile && !isNaN(audioFile.duration)) {
                    data.assessments[y].questions[x].question_time = audioFile.duration;
                    audioFileDownloaded(promise);
                  }
                });
              })(audioFile, y, x);
            }
          }
        }).
        error(function (data, status, headers, config) {
          // log error
        });
    };
    deferredLoadData.promise.then(function () {
      init();
    });

    //Start loading data.
    if(AuthFactory.getUserVerified()) {
      loadData();
      AuthFactory.setUserVerified(false);
    }
    else {
      $state.go("auth");
    }


    vm.onClickSelectedStatement = function (category, statement) {
      vm.selectedAnswerCategory = category;
      $scope.$broadcast('timer-stop');
      //Stop playing audio
      vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.stop();
      vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].selected.statement = statement;
    };

    vm.onClickSelectedAnswer = function (score, option) {
      if (vm.data.assessments[vm.currentAssessmentIndex].questions.length > vm.currentQuestionIndex) {
        vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.stop();
        if (score !== false) {
          vm.selectedAnswerScore = score;
          var catGryIndex = vm.getCategoryIndex(vm.selectedAnswerCategory);
          vm.addGraphData(catGryIndex, vm.selectedAnswerScore);
          vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].selected.option = option;
          vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].selected.score = vm.selectedAnswerScore;
          vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].selected.category = vm.selectedAnswerCategory;
          vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.stop();

        }
        //Next question
        vm.selectedAnswerCategory = null;
        vm.selectedAnswerScore = 0;

        if (vm.data.assessments[vm.currentAssessmentIndex].questions.length > vm.currentQuestionIndex + 1) {
          vm.currentQuestionIndex = vm.currentQuestionIndex + 1;
          //Start Timer Again
          $timeout(function () {
            $scope.$broadcast('timer-start');
            $scope.$broadcast('timer-set-countdown', vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].question_time);
            $scope.$apply();
            //Play next question
            vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.play();

          });
        }
        else {
          if (vm.currentAssessmentIndex == 0) {
            vm.tabActive[0] = false;
            vm.tabActive[1] = true;
            vm.currentQuestionIndex = 0;
            vm.currentAssessmentIndex = 1;
            $log.log('questions ended.move to next assessment');

            //Start timer again
            $timeout(function () {
              $scope.$broadcast('timer-start');
              $scope.$broadcast('timer-set-countdown', vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].question_time);
              $scope.$apply();
              //Play next question
              vm.data.assessments[vm.currentAssessmentIndex].questions[vm.currentQuestionIndex].audio.object.play();
            });
          }
          else {
            $log.log('Assessment ended');
            vm.isAssessmentEnded = true;
          }
        }
      }

    };

    vm.getCategoryIndex = function (category) {
      for (var x = 0; x < vm.data.assessments[vm.currentAssessmentIndex].categories.length; x++) {
        if (category == vm.data.assessments[vm.currentAssessmentIndex].categories[x])
          return x;
      }
    };

    vm.addGraphData = function (index, score) {
      vm.graphData[vm.currentAssessmentIndex][index] = vm.graphData[vm.currentAssessmentIndex][index] + score;
    };

    vm.numToChar = function (n) {
      return String.fromCharCode(97 + n);
    };


  }
})();