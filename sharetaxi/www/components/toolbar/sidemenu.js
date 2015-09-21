angular.module('st.sidemenu', [])
.directive('stSidemenu', function(){
	return {
		restrict: 'A',
		templateUrl: 'components/toolbar/sidemenu.html',
	}
});