const axios = require('axios');

module.exports = async function (raw, post_number, topic_id) {
	async function newForumPost(raw, post_number, topic_id, errors_permitted_count_left = 2) {
		return await axios(`https://forum.gethopscotch.com/posts.json`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Api-Username': 'FarmBot',
				'Api-Key': (topic_id == 66773) ? process.env.FORUM_KEY : process.env.FBK,
			},
			data: {
				raw: `<!--${Date.now()}-->\n${raw}`,
				topic_id: `${topic_id}`,
				reply_to_post_number: post_number,
			},
			redirect: 'follow',
		})
			.then((response) => {
				console.log(response.data);
				return;
			})
			.catch((error) => {
				console.log('error', error);
				console.log(error.response.data);
				if (errors_permitted_count_left > 0) setTimeout(async () => await newForumPost(raw, post_number, topic_id, errors_permitted_count_left - 1), 5000);
			});
	}
	return await newForumPost(raw, post_number, topic_id);
};
