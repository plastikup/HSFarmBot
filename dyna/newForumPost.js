const axios = require('axios');

let newForumPost = async (raw, post_number, errors_permitted_count_left = 2) => {
	// create new post
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
		.catch((error) => {
			console.log('error', error);
			console.log(error.response.data);
			if (errors_permitted_count_left > 0) setTimeout(async () => await newForumPost(raw, post_number, errors_permitted_count_left - 1), 5000);
		});

	// like the user [NOT SET TO ACTIVE UNTIL API KEY PERMISSIONS GET UPDATED]
	/*
	await axios(`https://forum.gethopscotch.com/post_actions.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Username': 'FarmBot',
			'Api-Key': process.env.FBK,
		},
		data: {
			id: post_number,
			post_action_type_id: 0,
			flag_topic: false,
		},
		redirect: 'follow',
	})
		.then((response) => response.data)
		.then((result) => console.log(result))
		.catch((error) => {
			console.log('error', error);
			console.log(error.response.data);
		});
	*/
};

module.exports.newForumPost = async function (raw, post_number) {
	return await newForumPost(raw, post_number);
};
