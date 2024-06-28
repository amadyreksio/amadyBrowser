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
            preload: path.join(__dirname, './preload.js'),
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



function runCDADownloader() {
  const script = spawn('python', ['./dwnldcda.py']);
  script.stdout.on('data', (data) => {
    const filename = data.toString().trim();
    console.log(`Download is completed successfully. Filename: ${filename}`);
    if(filename.includes('dwnl_end:')){
    mainWindow.webContents.send('yt-downld-finish', filename.replace('dwnl_end:',''));
    }
    
  });
 script.on('close', (code) => {
    console.log(`YT Downloader has finished its work with code: ${code}`);
    mainWindow.webContents.send('yt-downld-finish', code);
  });

  
  script.on('error', (err) => {
    console.error(`Błąd uruchamiania skryptu Python: ${err}`);
  });
}


const os = require ('os');
const username = os.userInfo ().username;

app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+T', () => {
        mainWindow.webContents.send('ctrl-t');
    });
globalShortcut.register('CommandOrControl+H', () => {
        mainWindow.webContents.send('history-open');
});
    
    const pythonPath = `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python`;
    if (fs.existsSync(pythonPath)) {
        // Instalacja bibliotek
        const installLibs = (lib) => {
            return new Promise((resolve, reject) => {
                const process = spawn('python', ['-m', 'pip', 'install', lib]);
                process.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(`Instalacja ${lib} nie powiodła się z kodem ${code}`);
                    }
                });
                process.on('error', (err) => {
                    reject(err);
                });
            });
        };

        Promise.all([installLibs('pytube'), installLibs('yt-dlp')])
            .then(() => {
                console.log('Installation of libraries was succesful');
                createMainWindow();
            })
            .catch((err) => {
                console.error('LIB_ERR:', err);
                createErrorWindow();
            });
    } else {
        createErrorWindow();
    }
    //globalShortcut.register('CommandOrControl+Shift+I', () => {
    //    console.log('test');
    //    mainWindow.webContents.send('devtoolsshr');
   // });

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
ipcMain.on("saveText-CDA", (event, txtVal,filename) => {
    fs.writeFile(path.resolve('./'+filename), txtVal.toString(), (err) => {
        if (!err) {
            console.log('File written');
            runCDADownloader();
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



ipcMain.on("history-add", (event, args) => {
    console.log('event: *history-add*');

    const filePath = path.join(__dirname, './history.txt');

    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            const currentDate = new Date();
            var dte=currentDate.getDate();
            dte=dte.lenght>1?dte:'0'+dte;
            var mnth=(currentDate.getMonth() + 1);
            mnth=mnth.lenght>1?mnth:'0'+mnth;
            const fileContent = args ? args + '|' + dte + '.' + mnth + '.' + currentDate.getFullYear() + ';' + data : data;

            fs.writeFile(filePath, fileContent, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                }
            });
        });
    } else {
        fs.writeFile(filePath, args, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            }
        });
    }
});


ipcMain.on("history-read",(e,filename)=>{
 const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        mainWindow.webContents.send('history-read-response', null);
      } else {
        mainWindow.webContents.send('history-read-response', data);
      }
    });
  } else {
    fs.writeFile(filePath, '', (err) => {
      
        mainWindow.webContents.send('history-read-response', '');
     
        mainWindow.webContents.send('history-read-response', '');
      
    });
  }
});

function createErrorWindow() {
    mainWindow = new BrowserWindow({
        title: 'Amady Browser - Error',
        width: 1380,
        height: 660,
        autoHideMenuBar: true,
        frame: true,
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
    mainWindow.loadFile(path.join(__dirname, './renderer/PythonWarning.html'));
}
//By am@dyreks.io
