// Adapted from http://codepen.io/gwhickman/pen/zpDFG

angular.module('st.intro', ['ionic', 'ngAnimate'])
.controller('introCtrl', ['$scope', '$state', '$timeout',
            function($scope, $state, $timeout){
  $scope.showSplash = true;
  $scope.showIntro = false;

  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('mapview');
    // Set a flag that we finished the tutorial
    window.localStorage['didTutorial'] = true;
  };

  ionic.Platform.ready(function() {
    $timeout(function() {
      // Check if the user already did the tutorial and skip it if so
      if(window.localStorage['didTutorial'] === "true") {
          $scope.startApp();
      } else {
          $scope.showSplash = false;
          $scope.showIntro = true;
      }
    }, 1200);
  });
  
  // Move to the next slide
  var nextSlide = function() {
    $scope.$broadcast('slideBox.nextSlide');
  };
  // Move to the next slide
  var prevSlide = function() {
    $scope.$broadcast('slideBox.prevSlide');
  };

  var slideIndex = 1;
  $scope.leftButton = "Skip";
  $scope.rightButton = "Next";

  $scope.leftButtonTap = function() {
    $scope.startApp();
  };

  // // Called each time the slide changes
  // $scope.slideChanged = function(index) {
  //   slideIndex = index;
  //   console.log(index);
  //   Check if we should update the left buttons
  //   if(index > 0) {
  //     // If this is not the first slide, give it a back button
  //     $scope.leftButtons = [
  //       {
  //         content: 'Back',
  //         type: 'button-positive button-clear',
  //         tap: function(e) {
  //           // Move to the previous slide
  //           $scope.$broadcast('slideBox.prevSlide');
  //         }
  //       }
  //     ];
  //   } else {
  //     // This is the first slide, use the default left buttons
  //     $scope.leftButtons = leftButtons;
  //   }
    
  //   // If this is the last slide, set the right button to
  //   // move to the app
  //   if(index == 2) {
  //     $scope.rightButtons = [
  //       {
  //         content: 'Start using ShareTaxi',
  //         type: 'button-positive button-clear',
  //         tap: function(e) {
  //           startApp();
  //         }
  //       }
  //     ];
  //   } else {
  //     // Otherwise, use the default buttons
  //     $scope.rightButtons = rightButtons;
  //   }
  // };
}]);