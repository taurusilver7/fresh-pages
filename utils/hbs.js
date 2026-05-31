// a helper to wrap around date to format it.
// register the helper with handlebars in server to use it in templates (dashboard.hbs)
const moment = require("moment");

module.exports = {
	formatDate: function (date, format) {
		return moment(date).format(format);
	},
	truncate: function (str, len) {
		if (!str) return "";
		const string = str.toString();

		if (string.length <= len) return string;

		let truncated = string.substring(0, len);
		truncated = truncated.substring(0, truncated.lastIndexOf(" "));
		return (
			(truncated.length > 0 ? truncated : string.substring(0, len)) + "..."
		);
	},
	stripTags: function (input) {
		if (!input) return "";
		return input.toString().replace(/<(?:.|\n)*?>/gm, "");
	},
	editIcon: function (storyUser, loggedUser, storyId, floating = true) {
		if (storyUser._id.toString() == loggedUser._id.toString()) {
			if (floating) {
				return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
			} else {
				return `<a href="/stories/edit/${storyId}"><i class="fas fa-edit"></i></a>`;
			}
		} else {
			return "";
		}
	},
	select: function (selected, options) {
		return options
			.fn(this)
			.replace(
				new RegExp(' value="' + selected + '"'),
				'$& selected="selected"',
			)
			.replace(
				new RegExp(">" + selected + "</option>"),
				' selected="selected"$&',
			);
	},
	json: function (context) {
		return JSON.stringify(context);
	},
	gt: function (a, b) {
		return a > b;
	},
	eq: function (a, b) {
		return a == b;
	},
	inc: function (value) {
		return parseInt(value) + 1;
	},
	
};
