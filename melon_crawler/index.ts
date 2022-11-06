
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';
import { connect } from '../db';
import album from '../db/models/album';
import song from '../db/models/song';
import dotenv from 'dotenv';

const sleep = async (ms: number) => {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, ms)
    })
}

const getAlbumImg = async (url: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    await sleep(100);
    // await page.waitForSelector('#d_album_org > span');
    await page.click('#d_album_org > span');
    await sleep(100);
    const html = await page.content();
    const $ = load(html);
    const src = $('#photoViewLayer');
    return src.attr('src');
}

const addAlbum = async (albumIds: string[]) => {
    try {
        const promiseAlbumData = albumIds.map(async (albumId) => {
            const url = `https://www.melon.com/album/detail.htm?albumId=${albumId}`
            const { data } = await axios.get(url);
            const $ = load(data);

            const type = $('#conts > div.section_info > div > div.entry > div.info > span').text().trim().slice(1, -1);

            let titleText = $("#conts > div.section_info > div > div.entry > div.info > div.song_name").text().trim();
            const titleArr = titleText.split('\n');
            const title = titleArr[titleArr.length - 1].trim();

            let imgUrl = await getAlbumImg(url);
            while (!imgUrl) {
                imgUrl = await getAlbumImg(url);
                await sleep(100);
            }
            const imgData = (await axios.get(imgUrl || '', { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(path.join(__dirname, 'img', title.replace(/'/gi, '').replace(/\//gi, '').trim() + '.jpg'), imgData);

            const release = $("#conts > div.section_info > div > div.entry > div.meta > dl > dd:nth-child(2)").text();

            const genreStr = $("#conts > div.section_info > div > div.entry > div.meta > dl > dd:nth-child(4)").text();
            const genre = genreStr?.split('/');

            const publisher = $('#conts > div.section_info > div > div.entry > div.meta > dl > dd:nth-child(6)').text();

            const agency = $('#conts > div.section_info > div > div.entry > div.meta > dl > dd:nth-child(8)').text();

            const description = '';

            const albumData = {
                title,
                type,
                release: new Date(release),
                genre,
                publisher,
                agency,
                description,
                imgUrl
            }
            return albumData;
        })
        const albumData = await Promise.all(promiseAlbumData);
        await album.create(albumData);
        console.log('create success');
    } catch (err) {
        console.log(err);
    }
}

const addSongs = async (songIds: string[]) => {
    try {
        const songDataList = songIds.map(async (songId) => {

            const { data } = await axios.get(`https://www.melon.com/song/detail.htm?songId=${songId}`);
            const $ = load(data);
            let titleText = $("#downloadfrm > div > div > div.entry > div.info > div.song_name").text().trim();
            const titleArr = titleText.split('\n');
            const title = titleArr[titleArr.length - 1].trim();

            const albumName = $("#downloadfrm > div > div > div.entry > div.meta > dl > dd:nth-child(2) > a").text();
            const albumData = await album.findOne({ title: albumName });
            if (!albumData) {
                console.log("no album");
                console.log(albumName);
                return;
            }
            const album_id = albumData._id;

            const release = $("#downloadfrm > div > div > div.entry > div.meta > dl > dd:nth-child(4)").text();

            const genreStr = $("#downloadfrm > div > div > div.entry > div.meta > dl > dd:nth-child(6)").text();
            const genre = genreStr?.split('/');

            const lyricsArr = ($("#d_video_summary").html() || '').split('\n');
            const lyrics = lyricsArr[1] ? lyricsArr[1].trim().replace(/\<br\>/gi, '\n') : '';

            const temp = $("#conts > div.section_prdcr > ul").text();
            const temp2 = temp.replace(/\t/gi, '').replace(/\r/gi, '').replace(/\n/gi, '');
            const authors = temp2.split('작사')
            const composer = authors[authors.length - 1].split('작곡');
            const arrager = composer[composer.length - 1].split('편곡');
            authors.pop();
            composer.pop();
            arrager.pop();

            const songData = {
                title,
                releaseDate: new Date(release),
                genre,
                authors,
                composer,
                arrager,
                album_id,
                youtubeUrl: '',
                lyrics: [
                    {
                        time: 0,
                        value: lyrics
                    }
                ],
            }
            return songData;
        })
        const a = await Promise.all(songDataList);
        // console.log(a);
        const b = await song.create(a);
        console.log(b.length);
        console.log('create success');
    } catch (err) {
        console.log(err);
    }
}

const createAllSongData = async () => {
    await connect();
    //4047062
    const songIds = [
        ''
    ]
    const a = songIds.slice(0, 10);
    console.log(a);
    await addSongs(a);
}

createAllSongData();