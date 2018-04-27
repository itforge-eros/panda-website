var app = new Vue({
	el: "#app",
	data: {
		spaceName: "",
		spaceURI: "",
		uploadBoxIsOpen: false
	},
	computed: {
		computedSpaceURI: function() {
			return this.spaceURI.toLowerCase().replace(/ /g, "-")
		}
	},
	methods: {
		toggleUploadBox: function() {
			this.uploadBoxIsOpen = !this.uploadBoxIsOpen;
			// if isOpen => call for upload URL and create dropzone
			// is isClosed => clear queue and remove dropzone
		}
	}
});

function createDropzone(url) {
	var imgDropzone = new Dropzone("div#imgDropzone", {
		url: url,
		maxFiles: 1,
		acceptedFiles: "image/*",
		dictDefaultMessage: "ลากภาพมาวางที่นี่ (อัพโหลดได้ 1 ภาพ)",
		dictMaxFilesExceeded:"เกินจำนวนไฟล์ที่อนุญาต",
		dictInvalidFileType: "ไม่ใช่รูปภาพ"
	});
}
