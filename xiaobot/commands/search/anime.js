const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { cleanXML } = require('../../structures/Util');
const { promisifyAll } = require('tsubaki');
const xml = promisifyAll(require('xml2js'));
const { animelistLogin } = require('../../config');

module.exports = class AnimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'anime',
            group: 'search',
            memberName: 'anime',
            description: 'Searches My Anime List for your query, getting anime results.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'query',
                    prompt: 'What anime would you like to search for?',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, args) {
        const { query } = args;
        try {
            const { text } = await snekfetch
                .get(`https://${animelistLogin}@myanimelist.net/api/anime/search.xml`)
                .query({ q: query });
            const { anime } = await xml.parseStringAsync(text);
            const synopsis = cleanXML(anime.entry[0].synopsis[0].substr(0, 2000));
            const embed = new MessageEmbed()
                .setColor(0x2D54A2)
                .setAuthor('My Anime List', 'https://i.imgur.com/R4bmNFz.png')
                .setURL(`https://myanimelist.net/anime/${anime.entry[0].id[0]}`)
                .setThumbnail(anime.entry[0].image[0])
                .setTitle(`${anime.entry[0].title[0]} (English: ${anime.entry[0].english[0] || 'N/A'})`)
                .setDescription(synopsis)
                .addField('❯ Type',
                    `${anime.entry[0].type[0]} - ${anime.entry[0].status[0]}`, true)
                .addField('❯ Episodes',
                    anime.entry[0].episodes[0], true)
                .addField('❯ Start Date',
                    anime.entry[0].start_date[0], true)
                .addField('❯ End Date',
                    anime.entry[0].end_date[0], true);
            return msg.embed(embed);
        } catch (err) {
            if (err.message === 'Parse Error') return msg.say('No Results.');
            else throw err;
        }
    }
};