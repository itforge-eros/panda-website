const apiURL = "https://api.space.itforge.io/graphql";

var app = new Vue({
	el: "#app",
	data: {
		spaceName: "",
		spaceURI: "",
		spaceId: "",
		uploadBoxIsOpen: false,
		memberToken: "",
		uploadBoxIsLoading: false
	},
	computed: {
		computedSpaceURI: function() {
			return this.spaceURI.toLowerCase().replace(/ /g, "-")
		}
	},
	methods: {
		toggleUploadBox: function() {
			if (!this.uploadBoxIsOpen) {
				this.uploadBoxIsLoading = true;
				// if isOpen => call for upload URL and create dropzone
				axios(apiURL, {
					method: "POST",
					data: {
						query: `mutation {uploadSpaceImage(input: {spaceId: "${app.spaceId}"})}`
					},
					headers: {"Authorization": "bearer" + app.memberToken}
				})
				.then(function(data) {
					console.log(data.data.data.uploadSpaceImage);
					createDropzone(data.data.data.uploadSpaceImage);
					app.uploadBoxIsLoading = false;
					app.uploadBoxIsOpen = true;
				})
				.catch(function(err) { console.log(err) });
			}
			// is isClosed => clear queue and remove dropzone
		}
	}
});

function createDropzone(url) {
	var imgDropzone = new Dropzone("div#imgDropzone", {
		url: url,
		maxFiles: 1,
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
		sending: function(file, xhr) {
			var _send = xhr.send;
			xhr.send = function() {_send.call(xhr, file);};
		}
	});
}
