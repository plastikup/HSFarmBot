const axios = require('axios');

let newForumPost = async (raw, post_number) => {
	await axios(`https://forum.gethopscotch.com/posts.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Username': 'FarmBot',
			'Api-Key': process.env.FBK,
		},
		data: {
			raw: `<!--${Date.now()}-->\n${raw}`,
			topic_id: '66178',
			reply_to_post_number: post_number,
		},
		redirect: 'follow',
	})
		.then((response) => response.data)
		.then((result) => console.log(result))
		.catch((error) => console.log('error', error));
};

module.exports.newForumPost = async function (raw, post_number) {
	return await newForumPost(raw, post_number);
};
