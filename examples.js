import Scope from 'Scope';
var scope = new Scope(document.getElementById('scope'));

scope.counter2 = 1;
scope.$digest();

scope.$watch(
  function (scope) {
    return scope.counter2;
  },
  function (newValue, oldValue, scope) {
    debugger;
    scope.$render();
  }
);

scope.counter2 = 2;
scope.$digest();

setInterval(function(){
  scope.counter2++;
  scope.$digest();
}, 1000);