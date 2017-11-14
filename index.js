"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();

var config = require('./config.json');

var afkMode = false;
var afkCache = [];

setTimeout(() => {
    afkCache = afkCache.filter(last => Date.now() - last.time < 10 * 60 * 1000);
}, 30 * 60 * 1000);

var sendMessage = (channel, msg, deleteAfter) => {
    if (!channel) {
        console.error('Channel was null');
        return;
    }
    if (!deleteAfter) deleteAfter = config.deleteAfter;
    console.log(deleteAfter);
    if (deleteAfter > 0) {
        channel.send(msg)
            .then(message => message.delete(deleteAfter * 1000))
            .catch(console.error);
    }
};

client.on('ready', () => {
    console.log('Ready to go!');
});

client.on('message', (msg) => {
    if (msg.author !== client.user) {
        if (afkMode && msg.channel.type === 'dm') {
            let last = afkCache.find(obj => obj.id === msg.author.id);
            if (last) {
                if (Date.now() - last.time < 10 * 60 * 1000) return;
                afkCache.splice(afkCache.indexOf(last), 1);
            }
            msg.reply(config.afkMessage);
            afkCache.push({ id: msg.author.id, time: Date.now() });
        }
        return;
    }
    if (!msg.content.startsWith(config.prefix)) {
        let newContent = msg.content;
        let rand = Math.random();
        config.replacements.forEach((replacement) => {
            if (newContent.indexOf(replacement.from) > -1) {
                newContent = newContent.replace(new RegExp(replacement.from, 'g'), replacement.to);
            }
        });
        if (newContent !== msg.content) {
            msg.edit(newContent)
                .catch(console.error);
        }
        return;
    }
    let args = msg.content.split(' ');
    let cmd = args.splice(0, 1)[0];
    cmd = cmd.substr(config.prefix.length, cmd.length - (config.prefix.length - 1));
    switch (cmd) {
        case 'help': 
            sendMessage(msg.channel, '\n`' + config.prefix + 'afk` Toggle AFK mode' + '\n', 15);
            break;
        case 'afk':
            afkMode = !afkMode;
            sendMessage(msg.channel, 'AFK Mode ' + (afkMode ? 'ENABLED' : 'DISABLED'));
            console.log('AFK: ' + afkMode);
            break;
        default:
            sendMessage(msg.channel, 'Invalid command! Use ' + config.prefix + 'help for more information.');
            break;
    }
    msg.delete();
});

client.login(config.token);
