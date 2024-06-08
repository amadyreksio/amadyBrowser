const { ipcRenderer}= require("electron");
document.addEventListener('DOMContentLoaded',(e)=>{
    document.getElementById('history-btn').addEventListener('click',(e)=>{
        openhistory();
        ipcRenderer.send('history-read','/history.txt');
    });
document.getElementById('event4').addEventListener("click", (event) => {
ipcRenderer.send('history-add',document.getElementById('urlbox').value);
});
document.getElementById('cls-hist').addEventListener('click',()=>{
    closehistory();
});
document.getElementById('event3').addEventListener('click',(e)=>{
    
var urlv=document.getElementById('varstore3').innerHTML;
var scripttext = `import yt_dlp
import re

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name)

def download_video(url, output_dir):
    ydl_opts = {
        'format': 'best'
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=False)
        title = sanitize_filename(info_dict['title'])
        output_path = f"{output_dir}/{title}.mp4"
        
        ydl_opts['outtmpl'] = output_path
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        return output_path

video_url = '`+urlv+`'
output_dir = r'c:\\\Users`+`\\\\`+username+`\\\downloads'
output_path = download_video(video_url, output_dir)

print(f'dwnl_end:{output_path}')
`;
ipcRenderer.send('saveText-CDA', scripttext,'dwnldcda.py');
});

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
function openhistory(){
document.getElementById('history-container').classList.remove('popup-showanim-400ms');
document.getElementById('history-container').classList.remove('popup-hideanim-400ms');
document.getElementById('history-container').classList.add('popup-showanim-400ms');
document.getElementById('history-container').style.pointerEvents='all';
document.getElementById('history-container').style.opacity='1';
document.getElementById('history-container').style.zIndex='99999';
}
ipcRenderer.on('history-read-response', (event, response) => {

  if (response!=''&&response!=null) {
    
    var history_array=response.split(';');
    history_array.forEach((tx)=>{
    var listelem=document.createElement('div');
    listelem.className='list-elem';
    var elemarray=tx.split('|');
    var txt=document.createElement('div');
    txt.textContent=elemarray[0];
    listelem.appendChild(txt);
    listelem.addEventListener('click',(e)=>{
    var actualtab=document.getElementById('actualtab').innerHTML;
    console.log(actualtab);
    document.getElementById('wv-'+actualtab).src=elemarray[0];
    });
    var btncopy=document.createElement('button');
    btncopy.className='btn-3';
    var icn=document.createElement('img');
    icn.src='./img/copy.png';
    icn.style.width='25px';
    btncopy.appendChild(icn);
    listelem.appendChild(btncopy);
    btncopy.style.position='relative';
    btncopy.style.top='-10px';
    btncopy.style.left='calc(100% - 40px)';
    btncopy.addEventListener('click',()=>{
    navigator.clipboard.writeText(elemarray[0]);
    });
    document.getElementById('hist-list').appendChild(listelem);
    
    });
  } else {
    console.error('Failed to read history:', response);
  }
});
function closehistory(){
document.getElementById('history-container').classList.remove('popup-showanim-400ms');
document.getElementById('history-container').classList.remove('popup-hideanim-400ms');
document.getElementById('history-container').classList.add('popup-hideanim-400ms');
document.getElementById('history-container').style.pointerEvents='none';
setTimeout(() => {
document.getElementById('history-container').style.opacity='0';
document.getElementById('history-container').style.zIndex='-1';
document.getElementById('hist-list').innerHTML='';
}, 400);
}
ipcRenderer.on('history-open',(e)=>{
openhistory();
ipcRenderer.send('history-read','/history.txt');
});