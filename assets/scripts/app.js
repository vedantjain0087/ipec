var myApp = angular.module('myApp',['ngRoute','btford.socket-io']);

angular
.module('myApp').service('fileUpload', function ($http,$log) {
  this.uploadFileToUrl = function(file, uploadUrl,type){

    var fd = new FormData();
    fd.append('file',file);
    fd.append('param',type);

    if(file != undefined){  
      console.log(file.type);
    var validExts = ['text/plain','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']; // Allowed Extensions
    if(validExts.indexOf(file.type)==-1){
      alert('Check File Type','Allowed files are pdf,jpg,jpeg and png.','warning');
      return;
    }
    if(file.type == "text/plain"){
      file.type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    if(file.size >= 10*1024*1024 ){  // Max Upload Size is 2MB
      alert('Check File Size','Max Upload size is 2 Mb','warning');
      return;
    }
   }
 
    var ret = $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined, withCredentials: true}
               }).then(function(response){
                if(response.data.error == true)
                alert('Problem in Upoading file',response.data.msg,'warning');
         return response;   
               }).catch(function(response){  
        alert('Error','File Could Not Be Uploaded..','error');
               });
    return ret;

       }
  
});



myApp.config(function ($routeProvider) {
    
    $routeProvider
    
    .when('/', {
        templateUrl: 'pages/home.html',
        controller: 'homeController'
    })

   
});

myApp.controller('homeController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){

var socket = io.connect("http://localhost:3000");
socket.emit("send_message","Hello world");

socket.on("new_message",function(data){
console.log(data);
alert(data);
});

}]);

