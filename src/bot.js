require("dotenv").config();

const fs = require("fs");
const { Client, MessageEmbed } = require('discord.js');
const configFile = require("./config.json");

const botToken = process.env.DISCORDJS_BOT_TOKEN;
const client = new Client();

const rpsKey = [ ["Rock", ":rock:"], ["Paper", ":scroll:"], ["Scissors", ":scissors:"] ];

let PREFIX = configFile.PREFIX;
let configData = {PREFIX: PREFIX}

client.on("ready", () => {
    console.log(`${client.user.tag} has logged in`);
});

client.on("message", (message) => {
    if (message.author.bot) {return;}
    if (message.channel.type == "dm") {return;}

    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);

        switch (CMD_NAME) {

            case "help":
                const newEmbed = new MessageEmbed()
                    .setColor("008E44")
                    .setTitle("Help Menu")
                    .addField(`${PREFIX}sayhi`, "Make the bot say hello to you.")
                    .addField(`${PREFIX}setprefix [prefix]`, "Change the bot's command prefix.\nIf the prefix argument is omitted, or if it is \"default\",\nthen it will return to the default prefix ($).")
                    .addField(`${PREFIX}rps {Your choice}`, "Play Rock-Paper-Scissors with the bot.")
                    .addField(`${PREFIX}rng {bound 1} {bound 2}`, "Generates a random number between the two bounds given.");

                message.channel.send(newEmbed);
            break;

            case "sayhi":
                var member = message.guild.member(message.author);
                var nickname = member ? member.displayName : null;
                message.channel.send(`Hello there, ${nickname}`);
            break;

            case "setprefix":
                let newPrefix = args[0] || "$";
                if (newPrefix.toUpperCase() == "DEFAULT") {newPrefix = "$";}
                PREFIX = newPrefix;

                configData.PREFIX = newPrefix;
                let data = JSON.stringify(configData);
                fs.writeFile('./src/config.json', data, function (err) {
                    if (err) {
                      console.log('There has been an error saving the bot\'s configuration data.');
                      console.log(err.message);
                      return;
                    }
                  });
                message.channel.send(`Prefix successfully changed to ${PREFIX}`);
                
            break;

            case "rps":
                let PLAYER_INPUT;
                
                try {
                    PLAYER_INPUT = rpsKey.findIndex((item) => item[0].toUpperCase() == args[0].toUpperCase()).toString() || "error";
                } catch {
                    if (args[0] == undefined) {message.channel.send("No move specified. Cancelling game."); return;}
                    message.channel.send(`${args[0]} isn\'t a valid input. Please try again.`);
                    return;
                }
                
                if (args[0] == undefined) {message.channel.send("No move specified. Cancelling game."); return;}
                if (PLAYER_INPUT == "error") {message.channel.send(`${args[0]} isn\'t a valid input. Please try again.`); return;}

                PLAYER_INPUT = parseInt(PLAYER_INPUT);
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
                let num1 = parseInt(args[0]) || "error", num2 = parseInt(args[1]) || "error";
                if (num1 == "error" || num2 == "error") {message.channel.send("Error: Invalid range given."); return;}
                if (num1 == num2) {message.channel.send("Error: Invalid range given."); return;}
                let min = Math.min(num1, num2);
                let max = Math.max(num1, num2);
                let num = Math.floor(Math.random() * (max - min) + min);
                message.channel.send(`The random number generator returned: ${num}`);
            break;
        }
    }
});

client.login(botToken);