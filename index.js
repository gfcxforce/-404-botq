const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, Routes, ChannelType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const express = require('express');

// --- RENDER KEEP-ALIVE (BOTUN UYUMAMASI İÇİN) ---
const app = express();
app.get('/', (req, res) => res.send('Bot 7/24 Online!'));
app.listen(process.env.PORT || 3000);

// --- BOT İSTEMCİSİ ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Verileri tutmak için (Bot kapanınca sıfırlanır, kalıcı olması için veritabanı lazım ama şimdilik işini görür)
const warnings = new Map(); 
const balances = new Map();

// --- SLASH KOMUTLARI TANIMLAMA ---
const commands = [
    new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banlar').addUserOption(o => o.setName('hedef').setDescription('Banlanacak kişi').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı atar').addUserOption(o => o.setName('hedef').setDescription('Atılacak kişi').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder().setName('uyar').setDescription('Kullanıcıya uyarı verir').addUserOption(o => o.setName('hedef').setDescription('Uyarılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('uyarı-göster').setDescription('Kullanıcının uyarı sayısını gösterir').addUserOption(o => o.setName('hedef').setDescription('Bakılacak kişi').setRequired(true)),
    new SlashCommandBuilder().setName('kanal-kilitle').setDescription('Kanalı mesajlara kapatır'),
    new SlashCommandBuilder().setName('kanal-aç').setDescription('Kanalın kilidini açar'),
    new SlashCommandBuilder().setName('kategori-aç').setDescription('Yeni bir kategori oluşturur').addStringOption(o => o.setName('isim').setDescription('Kategori adı').setRequired(true)),
    new SlashCommandBuilder().setName('kategori-sil').setDescription('Bir kategoriyi ve içindekileri siler').addChannelOption(o => o.setName('kategori').setDescription('Silinecek kategori').setRequired(true).addChannelTypes(ChannelType.GuildCategory)),
    new SlashCommandBuilder().setName('rol-ver').setDescription('Rol verir').addUserOption(o => o.setName('hedef').setRequired(true)).addRoleOption(o => o.setName('rol').setRequired(true)),
    new SlashCommandBuilder().setName('rol-al').setDescription('Rol alır').addUserOption(o => o.setName('hedef').setRequired(true)).addRoleOption(o => o.setName('rol').setRequired(true)),
    new SlashCommandBuilder().setName('sil').setDescription('Mesajları temizler').addIntegerOption(o => o.setName('sayı').setDescription('1-100 arası').setRequired(true)),
].map(c => c.toJSON());

// --- OTO MESAJ & EKONOMİ (MESAJ KOMUTLARI) ---
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    // Oto Mesaj
    const content = msg.content.toLowerCase();
    if (content === 'sa') msg.reply('Aleykümselam hoş geldin!');
    if (content === 'naber') msg.reply('İyiyim kanka, senden naber?');

    // OWO / CASH Sistemi
    if (content === '!404 owo' || content === '!404 cash') {
        let current = balances.get(msg.author.id) || 0;
        let randomAmount = Math.floor(Math.random() * 200) - 50; // -50 ile +150 arası (Eksilebilir de artabilir de)
        let newBalance = current + randomAmount;
        balances.set(msg.author.id, newBalance);
        
        const status = randomAmount >= 0 ? 'kazandın 💰' : 'kaybettin 💸';
        msg.reply(`**${Math.abs(randomAmount)}** cash ${status}. Güncel bakiyen: **${newBalance}**`);
