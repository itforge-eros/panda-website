const env = process.env.NODE_ENV || "dev";

let session = {
	env: env,
	currentUser: "",
	authenUrl: "/authen/login"
};
let user = { isAdmin: true, isApprover: true };
let faculty = [
	{ name: "คณะเทคโนโลยีสารสนเทศ", slug: "fac-it" },
	{ name: "คณะเทคโนโลยีการเกษตร", slug: "fac-agro" },
	{ name: "คณะสถาปัตยกรรมศาสตร์", slug: "fac-arch" },
	{ name: "คณะวิทยาศาสตร์", slug: "fac-sci" }
];
let requestInfo = [
	{ name: "ผู้จอง", data: "นาย สมศรี ชาวไร่" },
	{ name: "ยื่นคำร้องเมื่อ", data: "28 กุมภาพันธ์ 2561"},
	{ name: "วันที่ต้องการจอง", data: "30 กุมภาพันธ์ 2561"},
	{ name: "เวลาที่ต้องการจอง", data: "10.00 - 12.00"},
	{ name: "จำนวนที่นั่ง", data: "50"},
	{ name: "เหตุผล", data: "อย่าอยากรู้ให้มากได้ปะ"},
];

module.exports = {
	session: session,
	user: user,
	faculty: faculty,
	requestInfo: requestInfo
}
