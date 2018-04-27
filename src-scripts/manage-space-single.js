const apiURL = "https://api.space.itforge.io/graphql";

var app = new Vue({
	el: "#app",
	data: {
		spaceName: "",
		spaceURI: "",
		spaceId: "",
		uploadBoxIsOpen: false,
		memberToken: ""
	},
	computed: {
		computedSpaceURI: function() {
			return this.spaceURI.toLowerCase().replace(/ /g, "-")
		}
	}
});
// Dropzone.autoDiscover = false;
Dropzone.options.imgDropzone = {
	url: "temp",
	maxFiles: 1,
	autoProcessQueue: false,
	method: "put",
	acceptedFiles: "image/*",
	headers: [{"Content-Type": "image/jpeg"}],
	resizeWidth: 1000,
	resizeHeight: 500,
	resizeMethod: "crop",
	resizeMimeType: "image/jpeg",
	dictDefaultMessage: "ลากภาพมาวางที่นี่ (อัพโหลดได้ 1 ภาพ)",
	dictMaxFilesExceeded:"เกินจำนวนไฟล์ที่อนุญาต",
	dictInvalidFileType: "ไม่ใช่รูปภาพ",
	init: function() {
		var that = this;
		this.on("addedfile", function(file) {
			axios(apiURL, {
					method: "POST",
					data: {
						query: `mutation {uploadSpaceImage(input: {spaceId: "${app.spaceId}"})}`
					},
					headers: {"Authorization": "bearer" + app.memberToken}
				})
				.then(function(data) {
					that.options.url = data.data.data.uploadSpaceImage;
					that.processQueue();
				})
				.catch(function(err) { console.log(err) });
		});
		this.on("sending", function(file, xhr) {
			var _send = xhr.send;
			xhr.send = function() {_send.call(xhr, file);};
		});
	}
}
