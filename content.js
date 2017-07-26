var userId = $.cookie("c_user");
var idGroup = 707436202770775 // Bạn tự setup
var idPost = 788504734663921 // Bạn có thể cho tự động GET Id Post...
var dtsg = $("input[name='fb_dtsg']").val();
var Handle = returnToken(dtsg, userId).then(function(data){ // Vì đây là thuộc tính Promise, nên phải dùng hàm .then để gọi Value ra
	var token = data.match(/access_token=(.*)(?=&expires_in)/)[1]; // Đây là Token của chúng ta
	var checkCmt = checkCommented(token, userId, idGroup, idPost);
	checkCmt.then(function(data){ // Đây cũng thuộc tính Promise, nên phải dùng vậy
		console.log((jQuery.isEmptyObject(data["data"])) ? false : true); // check xem bạn có comment hay chưa?
	});
	var checkLike = checkLiked(token, userId, idGroup, idPost);
	checkLike.then(function(data){
		console.log((jQuery.isEmptyObject(data["data"])) ? false : true); // check xem bạn có like hay chưa?
	})
	
}) ? true : false;

function returnToken(dtsg, uid, app_id = 165907476854626) {
	// Return Token
	var Optional = {
    	method: "POST",
    	credentials: "include",
    	body: "fb_dtsg=" + dtsg + "&app_id="+app_id+"&redirect_uri=fbconnect%3A%2F%2Fsuccess&display=page&access_token=&from_post=1&return_format=access_token&domain=&sso_device=ios&__CONFIRM__=1&__user=" + uid,
  		headers: {
  			"Content-type": "application/x-www-form-urlencoded"
  		}
  	}; // Set Info Request
	return fetch("//www.facebook.com/v1.0/dialog/oauth/confirm", Optional).then(function(res){
		return res.status == 200 ? res.text() : false
  	})
}

function checkCommented(access_token, uid, page_id, post_id) {
	// body...
	var fields = ["id", "text", "time", "fromid", "is_private"]; // Số field cần lấy
	var select = ""; // Tạo Select cho FQL
	fields.forEach(function(value){
		select += value + ',';
	});
	select = select.substring(0, select.length - 1); // loại bỏ dấu , phía cuối
	// Lưu ý : 6 dòng trên là không bắt buộc, bạn có thể bỏ nó vào thẳng trong câu lênh bên dưới cũng dc
	return fetch("//graph.facebook.com/fql?q=SELECT+"+select+"+FROM+comment+WHERE+post_id=%22"+page_id+"_"+post_id+"%22+and+fromid="+uid+"&access_token="+access_token).then(function(res){
		try{
			if (res.status == 400) throw "Bad Request"; // bắt lỗi - xem Api có chả về Http Code là 400 hay không?
			if (res.status == 200) 
				return res.json() // nếu thành công thì chả về dạng JSON
			else throw "Fail"; // không phải thì cũng False luôn
		}catch(error){
			console.log(error); // In ra lỗi
			return false;
		}
  	})	
}

function checkLiked(access_token, uid, page_id, post_id) {
	// Check Liked
	return fetch("//graph.facebook.com/fql?q=SELECT+user_id+FROM+like+WHERE+post_id=%22"+page_id+"_"+post_id+"%22+and+user_id="+uid+"&access_token="+access_token).then(function(res){
		console.log(res);
		try{
			if (res.status == 400) throw "Bad Request"; // bắt lỗi - xem Api có chả về Http Code là 400 hay không?
			if (res.status == 200) 
				return res.json() // nếu thành công thì chả về dạng JSON
			else throw "Fail" // không phải thì cũng False luôn
		}catch(error){
			console.log(error); // In ra lỗi
			return false
		}
  	})
}