const { ipcRenderer}= require("electron");
document.addEventListener('DOMContentLoaded',(e)=>{
    document.getElementById('minimize').addEventListener('click',(e)=>{
        ipcRenderer.send('minimize');
    });
    
    document.getElementById('maximize').addEventListener('click',(e)=>{
    ipcRenderer.send('maximize');
    });
    document.getElementById('close').addEventListener('click',(e)=>{
    ipcRenderer.send('close');
    });

    document.getElementById('event1').addEventListener('click',(e)=>{
    
        var urlv=document.getElementById('varstore2').innerHTML;
        var scripttext = `
from pytube import YouTube
import re
def Download(link, username):
    youtubeObject = YouTube(link)
    youtubeObject = youtubeObject.streams.get_highest_resolution()
    title = youtubeObject.title
    safe_title = re.sub(r'[^a-zA-Z0-9 ]', '', title)
    filename = safe_title + ".mp4"
    try:
        youtubeObject.download("c:\\\\users\\\\"+ username +"\\\\downloads", filename)
        print(filename)  # Print filename upon successful download
    except Exception as e:
        print("An error has occurred:", e)

Download("` + urlv + `", "` + username + `")
`;
    ipcRenderer.send('saveText-YT', scripttext,'dwnld.py');
    });
    
});
const os = require ('os');
const username = os.userInfo ().username;
ipcRenderer.on('ctrl-t', (event, arg) => {
document.getElementById('addtab').click();
});

ipcRenderer.on('devtoolsshr', (event, arg) => {
    var wv=document.getElementById('wv-'+document.getElementById('varstore1').innerHTML);
    const devtoolsView = document.getElementById('DevTools');
    const browser = wv.getWebContents();
    browser.setDevToolsWebContents(devtoolsView.getWebContents());
    browser.openDevTools();
});
ipcRenderer.on('yt-downld-finish', (event, arg) => {
document.getElementById('event2').click(arg);
});
ipcRenderer.on('maximize-icn',()=>{
    document.getElementById('maximize-icn').src='./img/maximize.png';
});
ipcRenderer.on('minimize-icn',()=>{
    document.getElementById('maximize-icn').src='./img/fullscreen.png';
});