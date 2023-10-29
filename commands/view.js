(function() {
    const generateFarmImg = require('../script/generateFarmImg.js');

    function inventoryContent(userDb) {
        let inventoryContent = userDb.seedsInventory;
        inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
        let table = 'Seeds|Quantity\n-|-\n';
        for (let item in inventoryContent) {
            table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
        }
    
        inventoryContent = userDb.cropsInventory;
        inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
        table = table + '\nCrops|Quantity\n-|-\n';
        for (let item in inventoryContent) {
            table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
        }
    
        /* not devlp yet
        inventoryContent = userDb.specialItems;
        inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
        table = table + '\nSpecial Items|Quantity\n-|-\n';
        for (let item in inventoryContent) {
            table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
        }
        */
    
        return table;
    }

    var cm = async (input, userDb) => {
        switch (input) {
            case 'farm':
                return(`@${userDb.username}'s **farm**.\n\n${await generateFarmImg.generateFarmImg(userDb)}`);
                break;
            case 'inventory':
                return(`@${userDb.username}'s **inventory**.\n\n${inventoryContent(userDb)}`);
                break;
            case 'coins':
                return(`You have **${userDb.coins} coins**.`);
                break;
            default:
                return(`Unrecognized subcommand \`${input}\`.`);
                break;
        }
    };

    module.exports.cm_view = async function(stuff, userDb) {
        return await cm(stuff, userDb);
    }
}());