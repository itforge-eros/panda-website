const expect = require('chai').expect;
const dhp = require('../helpers/date.js');

describe('epochToDate()', () => {
	it('should create a date obj from an input epoch', () => {
		// arrange
		let epoch = 1532415007;
		let date1 = new Date(epoch * 1000);
		// act
		let date2 = dhp.epochToDate(1532415007);
		// assert
		expect(date2.valueOf()).to.be.equal(date1.valueOf());
	});
});

describe('bigEndianToDate()', () => {
	it('should create a date obj from big endian format', () => {
		let bigEndian = '2018-04-23';
		let date1 = new Date(2018, 3, 23);
		let date2 = dhp.bigEndianToDate(bigEndian);
		expect(date2.valueOf()).to.be.equal(date1.valueOf());
	});
});

describe('thaiDateOf()', () => {
	it('should return a Thai string from an input date obj', () => {
		let theDate = new Date(2018, 3, 23);
		let string1 = '23 เม.ย. 2018';
		let string2 = dhp.thaiDateOf(theDate);
		expect(string2).to.be.equal(string1);
	});
});

describe('slotToTime()', () => {
	it('should return a human-readable time slot from slot number', () => {
		let slot = 19;
		let string1 = '9:30';
		let string2 = dhp.slotToTime(slot);
		expect(string2).to.be.equal(string1);
	});
});
