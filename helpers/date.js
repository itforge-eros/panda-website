const monthsTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const epochToDate = epoch => new Date(epoch * 1000);
const bigEndianToDate = x => {
	x.split("-");
	return new Date(x[0], x[1], x[2])
}
const thaiDateOf = x => {
	return x.getDate() + " " + monthsTh[x.getMonth()] + " " + x.getFullYear()
}
