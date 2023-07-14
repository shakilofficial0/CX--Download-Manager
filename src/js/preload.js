const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        closeApp: () => {
			ipcRenderer.send('closeApp');
		},
        minimizeApp: () => {
            ipcRenderer.send('minimizeApp');
        },
        maximizeApp: () => {
            ipcRenderer.send('maximizeApp');
        },
        openExternal: (url) => {
            ipcRenderer.send('openExternal', url);
        }
    }
);

