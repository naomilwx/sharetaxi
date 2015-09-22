// Adapted from http://codepen.io/gwhickman/pen/zpDFG

angular.module('st.intro', ['ionic', 'ngAnimate'])
.controller('introCtrl', ['$scope', '$state', '$timeout', 
            function($scope, $state, $timeout){
  $scope.showSplash = true;
  $scope.showTutorial = false;

  ionic.Platform.ready(function() {
    $timeout(function () {
      $scope.showSplash = false;
      $scope.showTutorial = true;
    }, 1000);
  });

  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('mapview');
    // Set a flag that we finished the tutorial
    window.localStorage['didTutorial'] = true;
  };

  // Check if the user already did the tutorial and skip it if so
  if(window.localStorage['didTutorial'] === "true") {
    $scope.startApp();
  }
  // else{
  //   setTimeout(function () {
  //     navigator.splashscreen.hide();
  //   }, 750);
  // }
  

  // Move to the next slide
  $scope.nextIntroSlide = function() {
    $scope.$broadcast('slideBox.nextSlide');
  };

  // Our initial right buttons
  var rightButtons = [
    {
      content: 'Next',
      type: 'button-positive button-clear',
      tap: function(e) {
        // Go to the next slide on tap
        $scope.nextIntroSlide();
      }
    }
  ];
  
  // Our initial left buttons
  var leftButtons = [
    {
      content: 'Skip',
      type: 'button-positive button-clear',
      tap: function(e) {
        // Start the app on tap
        startApp();
      }
    }
  ];

  // Bind the left and right buttons to the scope
  $scope.leftButtons = leftButtons;
  $scope.rightButtons = rightButtons;


  // Called each time the slide changes
  $scope.slideChanged = function(index) {

    // Check if we should update the left buttons
    if(index > 0) {
      // If this is not the first slide, give it a back button
      $scope.leftButtons = [
        {
          content: 'Back',
          type: 'button-positive button-clear',
          tap: function(e) {
            // Move to the previous slide
            $scope.$broadcast('slideBox.prevSlide');
          }
        }
      ];
    } else {
      // This is the first slide, use the default left buttons
      $scope.leftButtons = leftButtons;
    }
    
    // If this is the last slide, set the right button to
    // move to the app
    if(index == 2) {
      $scope.rightButtons = [
        {
          content: 'Start using ShareTaxi',
          type: 'button-positive button-clear',
          tap: function(e) {
            startApp();
          }
        }
      ];
    } else {
      // Otherwise, use the default buttons
      $scope.rightButtons = rightButtons;
    }
  };
}]);