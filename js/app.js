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
        template: 'loading',
        controller: 'homeController'
    }) .when('/login', {
      templateUrl: 'pages/login.html',
      controller: 'loginController'
  })
  .when('/dashboard', {
    templateUrl: 'pages/dash.html',
    controller: 'dashController'
})
.when('/chat', {
  templateUrl: 'pages/home.html',
  controller: 'chatController'
}).when('/insert', {
  templateUrl: 'pages/insert.html',
  controller: 'insertController'
})
   
});

myApp.controller('homeController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){
  
  $window.location.href = 'https://vedantjain0087.github.io/ipec_temp/'; 
  
}]);
myApp.controller('chatController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){

$scope.send = $window.sessionStorage.sender;
$scope.rec = $window.sessionStorage.rec;


  var socket = io.connect("https://ipec.herokuapp.com");


//ChAt Scripts

$(".messages").animate({ scrollTop: $(document).height() }, "fast");

$("#profile-img").click(function() {
	$("#status-options").toggleClass("active");
});

$(".expand-button").click(function() {
  $("#profile").toggleClass("expanded");
	$("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function() {
	$("#profile-img").removeClass();
	$("#status-online").removeClass("active");
	$("#status-away").removeClass("active");
	$("#status-busy").removeClass("active");
	$("#status-offline").removeClass("active");
	$(this).addClass("active");
	
	if($("#status-online").hasClass("active")) {
		$("#profile-img").addClass("online");
	} else if ($("#status-away").hasClass("active")) {
		$("#profile-img").addClass("away");
	} else if ($("#status-busy").hasClass("active")) {
		$("#profile-img").addClass("busy");
	} else if ($("#status-offline").hasClass("active")) {
		$("#profile-img").addClass("offline");
	} else {
		$("#profile-img").removeClass();
	};
	
	$("#status-options").removeClass("active");
});

function newMessage() {
	message = $(".message-input input").val();
	if($.trim(message) == '') {
		return false;
  }
  socket.emit("send_message",{"msg":message,"username":$window.sessionStorage.username});
	$('<li class="replies"><img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
	$('.message-input input').val(null);
	$('.contact.active .preview').html('<span>You: </span>' + message);
	$(".messages").animate({ scrollTop: $(document).height() }, "fast");
};

$('.submit').click(function() {
  newMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});

//End of chat script





socket.on("new_message",function(data){

console.log(data);
if(data.username != $window.sessionStorage.username){
$('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + data.msg.msg + '</p></li>').appendTo($('.messages ul'));

	// $('.contact.active .preview').html('<span>You: </span>' + message);
	$(".messages").animate({ scrollTop: $(document).height() }, "fast");
}
});
   
   }]);
   myApp.controller('insertController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){

    $scope.insert_cmp = function(){

   
     $http({
       url: 'https://ipec.herokuapp.com/complains/insert',
       method: "POST",
       data: { "msg" : $scope.msg, 'category':$scope.category,'sender':$window.sessionStorage.username,'receiver':'amrit',"status":"Not seen"}
       //data:{'data': data}
   })
   .then(function(response) {
    swal("Complain feeded successfully", "", "success", {
      button: "Ok",
    });
         
   
    });
   
   }
     
     }]);

myApp.controller('loginController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){

 $scope.login = function(){
console.log($scope.username);
console.log($scope.password);

  $http({
    url: 'https://ipec.herokuapp.com/users/authenticate',
    method: "POST",
    data: { "username" : $scope.username, 'password':$scope.password}
    //data:{'data': data}
})
.then(function(response) {
if(response.status == 200){
  $window.sessionStorage.setItem("username",$scope.username );
  $window.location.href = '#dashboard';
}
      

 });

}
  
  }]);
  
  myApp.controller('dashController', ['$scope', '$http', '$location','$window','$rootScope','$route','fileUpload', function($scope,$http,$location,$window,$rootScope,$route,fileUpload){

$scope.start_chat = function(sender,rec){
console.log(sender);
console.log(rec);
  $window.sessionStorage.setItem("sender",sender);
  $window.sessionStorage.setItem("rec",rec );

  $window.location.href = '#chat';
}

    $http.get('https://ipec.herokuapp.com/complains')
    .success(function(result){
      $scope.complaints = result;
      console.log(result);
    })
    .error(function(data,status){
      console.log(data);
    });

 $scope.change_status = function(id){
   console.log(id);
  $http.put('https://ipec.herokuapp.com/complains/'+id)
  .success(function(result){
    swal("Status Changed Successfully", "", "success", {
      button: "Ok",
    });
    $http.get('https://ipec.herokuapp.com/complains')
    .success(function(result){
      $scope.complaints = result;
      console.log(result);
    })
    .error(function(data,status){
      console.log(data);
    });


  })
  .error(function(data,status){
    console.log(data);
  });

 }
     
 }]);
