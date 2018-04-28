const monthsTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const times = [];
for (let t = 0, i = 0; t <= 23.5; t+=0.5, i++) times.push({slot: i, time: t});

const epochToDate = epoch => new Date(epoch * 1000);
const bigEndianToDate = x => {
	// returns a Date object from a big endian string
	// example: "2018-04-23" => Date(2018, 3, 23)
	x = x.split("-");
	return new Date(x[0], x[1]-1, x[2])
}
const thaiDateOf = x => {
	// returns a Thai string of an input Date object
	// example: Date(2018, 3, 23) => "23 เม.ย. 2018"
	return x.getDate() + " " + monthsTh[x.getMonth()] + " " + x.getFullYear()
}
const slotToTime = slot => {
	// converts a slot number into human-readable string
	// example: 19 => "9:30"
	if (slot % 2 == 0) return times[slot].time.toString() + ":00";
	else return times[slot].time.toString().replace(".5", ":30");
}

module.exports = {
	epochToDate: epochToDate,
	bigEndianToDate: bigEndianToDate,
	thaiDateOf: thaiDateOf,
	slotToTime: slotToTime
}
