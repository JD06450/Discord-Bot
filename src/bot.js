require("dotenv").config();

const { Client, MessageEmbed } = require('discord.js');

const Database = require("replitdb-client");
const database = new Database();

const botToken = process.env.DISCORDJS_BOT_TOKEN;
const client = new Client();

const rpsKey = [ ["Rock", ":rock:"], ["Paper", ":page_with_curl:"], ["Scissors", ":scissors:"] ];

function checkRole(message) {
    let reqRole;
    (async () => { reqrole = database.get(`${message.guild.id}botRole`, "Swampy's Bot Mod") })();
    if (!message.member.roles.cache.find((r) => r.name === reqRole)) {
        message.channel.send("Sorry, but you don't have permission to use this command.");
        return 0;
    } else {
        return 1;
    }
}

client.on("ready", () => {
    console.log(`${client.user.tag} has logged in`);
});

client.on("message", async (message) => {
    if (message.author.bot) {return;}
    if (message.channel.type == "dm") {return;}

    let PREFIX = await database.get(`${message.guild.id}PREFIX`, "$");

    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        try {
             switch (CMD_NAME) {

                case "help":
                    const newEmbed = new MessageEmbed()
                        .setColor("008E44")
                        .setTitle("Help Menu")
                        .addField(`${PREFIX}changeBotAdminRole`, `Sets the role required to execute admin commands.`)
                        .addField(`${PREFIX}sayhi`, "Make the bot say hello to you.")
                        .addField(`${PREFIX}setprefix [prefix]`, "Change the bot's command prefix.\nIf the prefix argument is omitted, or if it is \"default\",\nthen it will return to the default prefix ($).")
                        .addField(`${PREFIX}rps [Your choice]`, "Play Rock-Paper-Scissors with the bot.\nIf choice is omitted, you will play a random item.")
                        .addField(`${PREFIX}rng [bound 1] [bound 2]`, "Generates a random number between the two bounds given.\nIf bounds are omitted, it will generate a number between 0 and 1.");

                    message.channel.send(newEmbed);
                break;

                case "sayhi":
                    var member = message.guild.member(message.author);
                    var nickname = member ? member.displayName : null;
                    message.channel.send(`Hello there, ${nickname}`);
                break;

                case "setprefix":
                    if (!chackRole(message)) {return;}
                    let newPrefix = args[0] || "$";
                    if (newPrefix.toUpperCase() == "DEFAULT") {newPrefix = "$";}
                    
                    await database.set(`${message.guild.id}PREFIX`, `${newPrefix}`);
                    
                    message.channel.send(`Prefix successfully changed to ${PREFIX}`);
                    
                break;

                case "rps":
                    let PLAYER_INPUT = args[0] || rpsKey[Math.floor(Math.random() * 3)][0];

                    PLAYER_INPUT = rpsKey.findIndex((item) => item[0].toUpperCase() == PLAYER_INPUT.toUpperCase());

                    let AI_CHOICE = Math.floor(Math.random() * 3);
                    
                    let WINNER;
                    if (AI_CHOICE == PLAYER_INPUT) {
                        WINNER = 0;
                    } else if ((AI_CHOICE + 1) % 3 == PLAYER_INPUT) {
                        WINNER = 1;
                    } else if ((PLAYER_INPUT + 1) % 3 == AI_CHOICE) {
                        WINNER = 2;
                    } // 0 = Tie, 1 = Player wins, 2 = AI wins
                    
                    let COLOR;
                    let RESULT;
                    if (WINNER == 0) {COLOR = "F8C300"; RESULT = [`We both chose ${rpsKey[PLAYER_INPUT][0].toLowerCase()}. It's a tie!`, "Better luck next time!"]}
                    if (WINNER == 1) {COLOR = "00D166"; RESULT = [`${rpsKey[PLAYER_INPUT][0]} beats ${rpsKey[AI_CHOICE][0].toLowerCase()}. You Win!`, "Congratulations!"]}
                    if (WINNER == 2) {COLOR = "F93A2F"; RESULT = [`${rpsKey[AI_CHOICE][0]} beats ${rpsKey[PLAYER_INPUT][0].toLowerCase()}. I Win!`, "Better luck next time!"]}

                    var member = message.guild.member(message.author);
                    var nickname = member ? member.displayName : null;

                    const RPS_EMBED = new MessageEmbed()
                        .setTitle("Rock Paper Scissors")
                        .setColor(`${COLOR}`)
                        .addField(`${nickname}`, rpsKey[PLAYER_INPUT][1], true)
                        .addField(`${client.user.username}`, rpsKey[AI_CHOICE][1], true)
                        .addField(`${RESULT[0]}`, `${RESULT[1]}`, false);
                    message.channel.send(RPS_EMBED);
                break;

                case "rng":
                    let num1 = parseInt(args[0]) || 0;
                    let num2 = parseInt(args[1]) || parseInt(args[0]) + 1 || 1;

                    if (num1 == num2) {message.channel.send("Error: Your upper and lower bounds can't be equal."); return;}
                    
                    let min = Math.min(num1, num2);
                    let max = Math.max(num1, num2);
                    let num = Math.floor((Math.random() * (max - min) + min) * 1000)/1000;
                    
                    message.channel.send(`The random number generator returned: ${num}`);
                break;

                case "changeBotAdminRole":
                    if (!checkRole(message)) {return;}
                    let role = args[0];
                    let newRole;

                    if (role.startsWith("<@&") && role.endsWith(">")) {role = role.substring(3, role.length - 1)}

                    newRole = message.guild.roles.cache.find((r) => r.name == role || r.id == parseInt(role.replace(/[^0-9]/, ""))) || undefined;

                    if (newRole == undefined) { message.channel.send("Sorry, I couldn't find the role you wanted."); return; }
                    if (newRole.name == "@everyone") { message.channel.send(`I'm sorry, but you cannot set the bot admin role to @everyone.`, {"allowedMentions": { "roles" : []}}); return; }
                    
                    await database.set(`${message.guild.id}botRole`, `${newRole}`);
                    
                    message.channel.send(`Bot admin commands can now only be performed by role: ${newRole.name}`, {allowedMentions: {"roles": []}});
                break;

                case "tictactoe":
                    message.channel.send(`:one:     :two:     :three:\n\n:four:     :five:     :six:\n\n:seven:     :eight:     :nine:`);
                break;
            }
        } catch (e) {
            console.log(e);
            message.channel.send("I'm sorry, but an error ocurred whilst trying to process your command. Please let the server moderators know so it can get fixed, thanks!");
        }
    }
});



client.login(botToken);

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(3000);