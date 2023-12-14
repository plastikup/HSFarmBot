module.exports.cm = function () {
	return `
Hey, I’m FarmBot, the cutest bot ever! Here are the following commands I can do. **Type \`@FarmBot\` before any of these** to get my attention! **Words in bracket**s mean that they **need to be changed based on what you want to put there**.
[quote=General]
\`@FarmBot begin\` — register you as a farmer with an account linked to your forum username. **this step is required to start playing the farming game**!
\`@FarmBot help\` — bring up introduction and list of commands (this post!)
\`@FarmBot view coins\` — display your inventory's coins
\`@FarmBot view shop\` — display MooseFarms Co.'s products
\`@FarmBot daily\` — claim your daily coins
[/quote]
[quote="Farming"]
\`@FarmBot view farm\` — display your farm
\`@FarmBot view inventory\` — display your items
\`@FarmBot water\` — water your crops (every 8 hours)
\`@FarmBot plant [item] spot [number]\` — plant seeds at select location (1, top left, to 9, bottom right)
\`@FarmBot harvest spot [number]\` — harvest crop at select location
[/quote]
[quote="MooseFarms Co."]
\`@FarmBot buy [product]\` — buy a product from MooseFarms
\`@FarmBot sell [number] [crop]\` — sell your harvested crops to make money
[/quote]
[quote="Auction"]
\`@FarmBot auction help\` — display detailed docs related to auction and its rules. **it is in your responsibility to consult those beforehand**
\`@FarmBot auction view\` — display the information about the current ongoing auction
\`@FarmBot auction bid [amount]\` — bid a certain amount on the ongoing auction
\`@FarmBot auction bid reset\` — reset your bid
\n*hsFB's auction is [u]not a gamble[/u]; never in any case you will lose coins, money, or any currency if you have not obtained the product you're bidding on.*
[/quote]
Have a bug report? Tag @/Tri-Angle! Have a concern or suggestion regarding the game itself? Tag @/StarlightStudios!\n\nHave fun, and don’t forget to water your crops!`;
};
