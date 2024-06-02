const path = require('path');
const { spawn } = require('child_process');
const { app, BrowserWindow, ipcMain, globalShortcut, session, webContents } = require('electron');
const fs = require('fs');

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Amady Browser',
        width: 1380,
        height: 660,
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            
            webviewTag: true,
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
            icon: path.join(__dirname, 'icon.png')
        }
    });
    mainWindow.maximize();
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

 mainWindow.webContents.session.on('will-download', (event, item, webContents) => {

    console.log(`Pobieranie rozpoczęte: ${item.getFilename()} - ${item.getTotalBytes()} bajtów`);


    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Pobieranie zatrzymane');
        } else {
          const receivedBytes = item.getReceivedBytes();
          const totalBytes = item.getTotalBytes();
          const progress = (receivedBytes / totalBytes) * 100;
          console.log(`Postęp: ${progress.toFixed(2)}% (${receivedBytes} z ${totalBytes} bajtów)`);
        }
      } else if (state === 'interrupted') {
        console.log('Pobieranie przerwane');
      }
    });


    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log(`Pobieranie zakończone: ${item.getSavePath()}`);
      } else {
        console.log(`Pobieranie nieudane: ${state}`);
      }
    });
  });

}

function runYTDownloader() {
  const script = spawn('python', ['./dwnld.py']);
  script.stdout.on('data', (data) => {
    const filename = data.toString().trim();
    console.log(`Download is completed successfully. Filename: ${filename}`);
    mainWindow.webContents.send('yt-downld-finish', filename);
  });
 script.on('close', (code) => {
    console.log(`YT Downloader has finished its work with code: ${code}`);
    mainWindow.webContents.send('yt-downld-finish', code);
  });

  
  script.on('error', (err) => {
    console.error(`Błąd uruchamiania skryptu Python: ${err}`);
  });
}





app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+T', () => {
        mainWindow.webContents.send('ctrl-t');
    });
    //globalShortcut.register('CommandOrControl+Shift+I', () => {
    //    console.log('test');
    //    mainWindow.webContents.send('devtoolsshr');
   // });

    createMainWindow();
}).catch((err) => {
    console.error('App failed to initialize:', err);
});

ipcMain.on("saveText", (event, txtVal,filename) => {
    fs.writeFile(path.resolve('./'+filename), txtVal.toString(), (err) => {
        if (!err) {
            console.log('File written');
        } else {
            console.log(err);
        }
    });
});
ipcMain.on("saveText-YT", (event, txtVal,filename) => {
    fs.writeFile(path.resolve('./'+filename), txtVal.toString(), (err) => {
        if (!err) {
            console.log('File written');
            runYTDownloader();
        } else {
            console.log(err);
        }
    });
});

ipcMain.on("loadText", (event, fileName) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        event.reply('loadedText', data);
    });
});
ipcMain.on("maximize", (event) => {
if(!mainWindow.isMaximized()){
mainWindow.maximize();
mainWindow.webContents.send('maximize-icn');
}else{
mainWindow.webContents.send('minimize-icn');
mainWindow.unmaximize();
}
});
ipcMain.on("minimize", (event) => {
mainWindow.minimize();
});
ipcMain.on("close", (event) => {
app.quit();
});



ipcMain.on("history-add",(event,args)=>{
fs.writeFile(path.join(__dirname,'/history.txt'));
});


ipcMain.on("history-read",(e)=>{
  if(fs.existsSync(path.join(__dirname,'/history.txt'))){
    fs.readFile(fileName, 'utf-8', (err, data) => {
    e.reply(data);
    });
     
  }else{
    fs.writeFile(path.join(__dirname,'/history.txt'));
  }
});
